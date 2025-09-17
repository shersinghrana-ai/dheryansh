import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div className={`
      bg-gradient-to-br from-slate-800 to-slate-900 
      border border-slate-700 
      rounded-xl 
      shadow-lg 
      ${hover ? 'hover:shadow-xl hover:border-slate-600 transition-all duration-200' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};