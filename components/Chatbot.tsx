
import React, { useState, useRef, useEffect } from 'react';
import { chatAssistant } from '../services/geminiService';
import { UserRole } from '../types';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const Chatbot: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: `Hello! I'm your HostelX AI Assistant. How can I help you today as a ${userRole}?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    const response = await chatAssistant(userMsg, messages);
    setMessages(prev => [...prev, { role: 'model', content: response || "I'm offline right now." }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 md:w-96 h-[500px] cyber-card rounded-2xl flex flex-col shadow-2xl animate-fade-in border-t-4 border-[#00D4FF]">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <h3 className="font-orbitron text-xs font-bold tracking-widest">HOSTELX AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-[#00D4FF] text-black font-bold' : 'bg-white/10 text-white'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/10 p-3 rounded-xl text-[10px] animate-pulse uppercase tracking-widest font-bold">AI IS THINKING...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="relative">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-4 pr-12 text-sm focus:outline-none focus:border-[#00D4FF]"
              />
              <button 
                onClick={handleSend}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00D4FF] p-2"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-[#00D4FF] text-black shadow-lg shadow-[#00D4FF40] flex items-center justify-center text-xl hover:scale-110 transition-transform hover:shadow-[#00D4FF60]"
        >
          <i className="fas fa-comment-dots"></i>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
