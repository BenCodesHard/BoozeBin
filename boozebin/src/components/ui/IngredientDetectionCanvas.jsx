'use client';

import React from 'react';

/**
 * Simple component for displaying a selected ingredient image.
 * The image is displayed at its natural size without any canvas manipulation, 
 * scrolling or zooming capabilities.
 * 
 * @param {Object} props - Component props
 * @param {string} props.imageSrc - The source of the image (URL or data URL)
 */
const IngredientDetectionCanvas = ({ imageSrc }) => {
  return (
    <div className="w-full flex flex-col items-center bg-[#13131f] rounded-lg p-2">
      <div className="w-full flex justify-center items-center">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Selected ingredient"
            className="max-w-full rounded border border-purple-700/50"
          />
        ) : (
          <div className="w-full h-[250px] flex items-center justify-center text-gray-500">
            Select an image to detect ingredients
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientDetectionCanvas;
