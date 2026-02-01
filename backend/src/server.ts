// Server - Entry point aplikasi Express.js dengan middleware dan routing
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
connectDatabase();
app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({
    name: 'ERP-Mate API',
    version: '1.0.0',
    modules: ['User Management', 'Inventory', 'Finance', 'Projects', 'AI Chat']
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 ERP-Mate Server running on port ${PORT}`);
});