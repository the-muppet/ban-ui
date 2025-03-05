'use client';

import React, { useState, useEffect } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pill' | 'underline';
  align?: 'start' | 'center' | 'end' | 'stretch';
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  className,
  onChange,
  variant = 'default',
  align = 'start'
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || (tabs[0]?.id || ''));

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  // Get variant styles
  const getTabStyles = (isActive: boolean) => {
    const baseStyles = 'tab relative transition-all duration-300';
    const alignmentStyles = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      stretch: 'flex-1 text-center'
    };

    const variantStyles = {
      default: isActive 
        ? 'tab--active' 
        : '',
      pill: isActive 
        ? 'bg-glass-background border border-glass-border rounded-full' 
        : 'hover:bg-glass-background/50 rounded-full',
      underline: isActive 
        ? 'border-b-2 border-primary' 
        : 'border-b-2 border-transparent'
    };

    return cn(
      baseStyles,
      alignmentStyles[align],
      variantStyles[variant],
      isActive && 'text-primary'
    );
  };
  return (
    <div className={cn('tabs-container', className)}>
      <div className={cn('tabs', `tabs--${variant}`, `tabs--${align}`)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={getTabStyles(activeTab === tab.id)}
            onClick={() => handleTabClick(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content transition-all duration-300">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default Tabs;

function cn(...args: (string | boolean | undefined)[]) {
    return args.filter(Boolean).join(' ');
}
