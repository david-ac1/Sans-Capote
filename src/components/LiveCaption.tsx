"use client";

import React, { useEffect, useState } from 'react';

interface LiveCaptionProps {
  text: string;
  isVisible: boolean;
  language: string;
}

export function LiveCaption({ text, isVisible, language }: LiveCaptionProps) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (text && isVisible) {
      setDisplayText(text);
    } else {
      setDisplayText('');
    }
  }, [text, isVisible]);

  if (!isVisible || !displayText) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-relevant="additions text"
      className="fixed bottom-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-3xl z-50 transition-all duration-300 opacity-100 translate-y-0"
    >
      <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div 
            className="flex-shrink-0 w-2 h-2 mt-2 bg-green-500 rounded-full animate-pulse"
            aria-hidden="true"
          />
          <div className="flex-1">
            <p className="text-sm text-slate-400 mb-1 font-medium">
              {language === 'fr' ? 'Sous-titre en direct' : 'Live Caption'}
            </p>
            <p className="text-white leading-relaxed">
              {displayText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
