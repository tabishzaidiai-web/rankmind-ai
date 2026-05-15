'use client';
import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  children: (activeTab: string) => React.ReactNode;
  className?: string;
}

export function Tabs({ tabs, defaultTab, children, className = '' }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);
  return (
    <div className={className}>
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              active === tab.id
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  );
}

export default Tabs;
