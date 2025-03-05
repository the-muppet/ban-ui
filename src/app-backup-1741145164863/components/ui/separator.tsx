// src/components/ui/Separator.tsx
import React from 'react';
import './Separator.css';

interface SeparatorProps {
  text: string;
  className?: string;
}

const Separator: React.FC<SeparatorProps> = ({ 
  text, 
  className = ''
}) => {
  return (
    <div className={`separator ${className}`}>
      <span className="separator-text">{text}</span>
    </div>
  );
};

export default Separator;