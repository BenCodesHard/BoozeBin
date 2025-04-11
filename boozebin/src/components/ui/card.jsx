import React from "react";

export const Card = ({ children, className, ...props }) => {
  return (
    <div 
      className={`bg-opacity-80 rounded-lg shadow-md ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};