import React from 'react';
import { Message, Role } from '../types';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div
        className={`
          max-w-[85%] md:max-w-[75%] lg:max-w-[60%] 
          rounded-2xl px-5 py-3.5 shadow-md leading-relaxed
          ${isUser 
            ? 'bg-indigo-600 text-white rounded-br-none' 
            : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
          }
        `}
      >
        <div className="text-sm font-semibold mb-1 opacity-75">
          {isUser ? 'You' : 'Gemini'}
        </div>
        <div className="whitespace-pre-wrap break-words text-[15px]">
          {message.content}
        </div>
      </div>
    </div>
  );
};
