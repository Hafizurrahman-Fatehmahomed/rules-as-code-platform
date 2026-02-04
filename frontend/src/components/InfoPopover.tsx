'use client';

import React, { useState } from 'react';

interface InfoPopoverProps {
  title: string;
  content: string;
  children?: React.ReactNode;
}

export default function InfoPopover({ title, content, children }: InfoPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-5 h-5 ml-1 text-blue-500 rounded-full bg-blue-50 hover:bg-blue-100 focus:outline-none"
        title={title}
      >
        <span className="text-xs font-bold">?</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg bottom-full mb-2 left-1/2 transform -translate-x-1/2">
          <div className="absolute w-2 h-2 bg-white border-b border-r border-gray-200 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>
          <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
          <p className="text-gray-600 text-xs leading-relaxed">{content}</p>
          {children && <div className="mt-2 text-xs">{children}</div>}
        </div>
      )}
    </div>
  );
}
