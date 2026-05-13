import React, { useRef, useEffect, useState } from 'react';

export function AutoScaleText({ children, className = '', maxScale = 1 }: { children: React.ReactNode, className?: string, maxScale?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(maxScale);

  useEffect(() => {
    const resizeText = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.scrollWidth;
        if (textWidth > 0 && containerWidth > 0) {
          const newScale = Math.min(maxScale, containerWidth / textWidth);
          setScale(newScale);
        }
      }
    };
    
    // Resize immediately and on window resize
    resizeText();
    // Sometimes fonts load later or layout shifts, small timeout helps
    setTimeout(resizeText, 0);
    window.addEventListener('resize', resizeText);
    return () => window.removeEventListener('resize', resizeText);
  }, [children, maxScale]);

  return (
    <div ref={containerRef} className={`w-full overflow-hidden flex items-center ${className}`}>
      <div 
        ref={textRef} 
        style={{ transform: `scale(${scale})`, transformOrigin: 'left center', whiteSpace: 'nowrap' }}
      >
        {children}
      </div>
    </div>
  );
}
