// Gemini - Konfigurasi Google Generative AI untuk chatbot
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
export const aiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
export default genAI;
