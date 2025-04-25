'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Component for displaying an image with highlighted ingredient bounding boxes.
 * Includes zoom controls and modal view to enhance visibility of overlapping boxes.
 * 
 * @param {Object} props - Component props
 * @param {string} props.imageSrc - The source of the image (URL or data URL)
 * @param {Array} props.detectedIngredients - Array of detected ingredients with bounding boxes
 * @param {Function} props.onCanvasReady - Callback when canvas is ready with its dimensions
 */
const IngredientDetectionCanvas = ({ imageSrc, detectedIngredients }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Load image and get its dimensions
  useEffect(() => {
    if (!imageSrc) return;
    setIsImageLoaded(false);
    const image = new window.Image();
    image.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Set canvas dimensions to match the image aspect ratio
      const maxWidth = 800;
      const maxHeight = 600;
      let width = image.width;
      let height = image.height;
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
      }
      canvas.width = width;
      canvas.height = height;
      setImageDimensions({ width, height });
      // Draw the image on the canvas
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, width, height);
      setIsImageLoaded(true);
    };
    image.onerror = () => {
      setIsImageLoaded(false);
    };
    image.src = imageSrc;
  }, [imageSrc]);

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col items-center bg-[#13131f] rounded-lg p-2 overflow-hidden"
    >
      <div className="w-full flex justify-center items-center overflow-auto">
        {imageSrc ? (
          <canvas
            ref={canvasRef}
            className="rounded border border-purple-700/50"
          />
        ) : (
          <div className="w-full h-[250px] flex items-center justify-center text-gray-500">
            Select an image to detect ingredients
          </div>
        )}
      </div>
      {isImageLoaded && imageDimensions.width > 0 && (
        <div className="mt-2 text-xs text-gray-400">
          Original size: {imageDimensions.width} x {imageDimensions.height}px
        </div>
      )}
    </div>
  );
};

export default IngredientDetectionCanvas;
