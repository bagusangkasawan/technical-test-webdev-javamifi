// Komponen Chatbot - AI Assistant dengan Google Gemini
import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Bot,
  X,
  Send,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { chatApi } from '../../services/api';

interface ChatbotProps {
  token: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const Chatbot: React.FC<ChatbotProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Halo! Saya adalah Asisten ERP-Mate yang didukung oleh Google Gemini. Saya dapat membantu Anda dengan:\n\n• Wawasan dan analitik bisnis\n• Pertanyaan manajemen inventaris\n• Analisis data keuangan\n• Panduan manajemen proyek\n\nAda yang bisa saya bantu hari ini?',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatApi.send(userMessage, sessionId || undefined);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.reply },
      ]);
      setSessionId(response.sessionId);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Maaf, terjadi kesalahan saat menghubungkan ke layanan AI. Silakan coba lagi.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Obrolan dihapus. Ada yang bisa saya bantu?',
      },
    ]);
    setSessionId(null);
  };

  const quickPrompts = [
    'Analisis status inventaris',
    'Tampilkan ringkasan keuangan',
    'Ringkasan progres proyek',
    'Peringatan stok rendah',
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[calc(100vw-32px)] sm:w-96 h-[70vh] sm:h-[550px] max-h-[600px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300 mb-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1">
                  Asisten ERP
                  <Sparkles size={12} className="text-yellow-300" />
                </h3>
                <span className="flex items-center gap-1 text-[10px] text-blue-100">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Didukung oleh Gemini AI
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="hover:bg-white/20 p-1.5 rounded transition"
                title="Clear chat"
              >
                <RotateCcw size={16} className="hover:-rotate-90 transition-transform duration-200" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1.5 rounded transition"
              >
                <X size={16} className="hover:-rotate-90 transition-transform duration-200" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none text-sm shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                    <span className="text-gray-500 text-xs">Berpikir...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-white border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Perintah cepat:</p>
              <div className="flex flex-wrap gap-1">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-full transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              value={input}
              onKeyDown={handleKeyDown}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya apa saja tentang bisnis Anda..."
              className="flex-1 text-sm p-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen
            ? 'bg-gray-700 rotate-90 scale-90'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-110'
        } text-white p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center group`}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <MessageSquare size={28} />
          </>
        )}
      </button>
    </div>
  );
};
