// Controller Chat - Handler untuk AI chatbot dengan Google Gemini
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { aiModel } from '../config/gemini';
import { ChatHistory, Product, Transaction, Project, User } from '../models';
import { AuthRequest } from '../middleware';

const getSystemContext = async () => {
  // Get real-time data from database for context
  const [productCount, transactionCount, projectCount, userCount] = await Promise.all([
    Product.countDocuments(),
    Transaction.countDocuments(),
    Project.countDocuments(),
    User.countDocuments(),
  ]);

  const lowStockProducts = await Product.find({
    $expr: { $lte: ['$stock', '$minStock'] },
  }).limit(5);

  const recentTransactions = await Transaction.find()
    .sort({ date: -1 })
    .limit(5);

  const activeProjects = await Project.find({ status: 'active' }).limit(5);

  return `
You are ERP-Mate Assistant, an intelligent AI assistant for enterprise resource planning.
You have access to the following real-time business data:

CURRENT STATISTICS:
- Total Products in Inventory: ${productCount}
- Total Transactions: ${transactionCount}
- Total Projects: ${projectCount}
- Total Users: ${userCount}

LOW STOCK ALERTS:
${lowStockProducts.length > 0 
  ? lowStockProducts.map(p => `- ${p.name}: ${p.stock} units (min: ${p.minStock})`).join('\n')
  : '- No low stock alerts'}

RECENT TRANSACTIONS:
${recentTransactions.map(t => `- ${t.type}: $${t.amount} - ${t.description}`).join('\n')}

ACTIVE PROJECTS:
${activeProjects.map(p => `- ${p.title} (${p.progress}% complete)`).join('\n')}

CAPABILITIES:
1. Answer questions about inventory, finance, and projects
2. Provide business insights and recommendations
3. Help with ERP navigation and feature explanations
4. Analyze business performance and trends
5. Suggest actions based on current data

GUIDELINES:
- Be concise but informative
- Use the real data provided when answering questions
- If asked about specific records, use the context data
- For operations you can't perform, explain what the user can do in the ERP system
- Be helpful and professional

User question:
`;
};

// Chat with AI
export const chat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt, sessionId } = req.body;
    const userId = req.user?._id;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // Get or create chat session
    const chatSessionId = sessionId || uuidv4();
    
    // Get system context with real data
    const systemContext = await getSystemContext();
    
    // Generate AI response
    const result = await aiModel.generateContent(`${systemContext} ${prompt}`);
    const response = await result.response;
    const reply = response.text();

    // Save chat history
    if (userId) {
      await ChatHistory.findOneAndUpdate(
        { userId, sessionId: chatSessionId },
        {
          $push: {
            messages: [
              { role: 'user', content: prompt, timestamp: new Date() },
              { role: 'assistant', content: reply, timestamp: new Date() },
            ],
          },
        },
        { upsert: true, new: true }
      );
    }

    res.json({ 
      reply, 
      sessionId: chatSessionId 
    });
  } catch (error) {
    console.error('Gemini AI Error:', error);
    res.status(500).json({ error: 'AI Service Unavailable' });
  }
};

// Get chat history
export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?._id;

    const history = await ChatHistory.findOne({ userId, sessionId });
    
    res.json(history?.messages || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

// Get all chat sessions for user
export const getChatSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const sessions = await ChatHistory.find({ userId })
      .select('sessionId createdAt updatedAt')
      .sort({ updatedAt: -1 });
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
};

// Delete chat session
export const deleteChatSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?._id;

    await ChatHistory.findOneAndDelete({ userId, sessionId });
    
    res.json({ message: 'Chat session deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
};

// Quick analysis endpoint
export const analyzeData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.query; // inventory, finance, projects
    
    let analysisPrompt = '';
    
    switch (type) {
      case 'inventory':
        const products = await Product.find().limit(20);
        analysisPrompt = `Analyze this inventory data and provide insights:\n${JSON.stringify(products)}`;
        break;
      case 'finance':
        const transactions = await Transaction.find().sort({ date: -1 }).limit(30);
        analysisPrompt = `Analyze these financial transactions and provide insights:\n${JSON.stringify(transactions)}`;
        break;
      case 'projects':
        const projects = await Project.find().limit(10);
        analysisPrompt = `Analyze these projects and provide progress insights:\n${JSON.stringify(projects)}`;
        break;
      default:
        res.status(400).json({ error: 'Invalid analysis type' });
        return;
    }

    const systemContext = await getSystemContext();
    const result = await aiModel.generateContent(`${systemContext}\n\n${analysisPrompt}`);
    const response = await result.response;
    
    res.json({ analysis: response.text() });
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
};
