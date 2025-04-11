"use client";

import React, { useRef, useState, useEffect } from "react";

export const ScrollShadow = ({ children, className, size = 100 }) => {
  const containerRef = useRef(null);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    // Show top shadow when not at the top
    setShowTopShadow(container.scrollTop > 10);
    
    // Show bottom shadow when not at the bottom
    setShowBottomShadow(
      container.scrollHeight - container.scrollTop - container.clientHeight > 10
    );
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // Check initial scroll position
      handleScroll();
      
      // Set up the scroll event listener
      container.addEventListener("scroll", handleScroll);
      
      // Clean up
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div className="relative">
      {showTopShadow && (
        <div 
          className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#0f0f1f] to-transparent z-10 pointer-events-none"
        />
      )}
      <div 
        ref={containerRef}
        className={`overflow-y-auto ${className}`}
        style={{ maxHeight: `${size}px` }}
      >
        {children}
      </div>
      {showBottomShadow && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#0f0f1f] to-transparent z-10 pointer-events-none"
        />
      )}
    </div>
  );
};