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
const IngredientDetectionCanvas = ({ imageSrc, detectedIngredients, onCanvasReady }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // Toggle modal view
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    // Reset zoom when opening/closing modal
    setZoomLevel(1);
  };

  // Apply zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prevZoom => Math.min(prevZoom + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prevZoom => Math.max(prevZoom - 0.25, 0.5));
  };
  
  // Handle mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    
    // Determine zoom direction
    if (e.deltaY < 0) {
      // Zoom in
      setZoomLevel(prevZoom => Math.min(prevZoom + 0.1, 3));
    } else {
      // Zoom out
      setZoomLevel(prevZoom => Math.max(prevZoom - 0.1, 0.5));
    }
  };
  
  // Load image and get its dimensions
  useEffect(() => {
    if (!imageSrc) return;
    
    setIsImageLoaded(false);
    const image = new Image();
    
    image.onload = () => {
      // Get the canvas element
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set canvas dimensions to match the image aspect ratio
      // Increased base size for better visibility
      const maxWidth = 800; // Increased from 600
      const maxHeight = 600; // Increased from 400
      
      let width = image.width;
      let height = image.height;
      
      // Scale down if necessary while maintaining aspect ratio
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
      
      if (onCanvasReady) {
        onCanvasReady({ width, height });
      }
    };
    
    image.onerror = () => {
      console.error('Error loading image');
      setIsImageLoaded(false);
    };
    
    // Handle both data URLs and regular URLs
    image.src = imageSrc;
  }, [imageSrc, onCanvasReady]);
  
  // Draw bounding boxes when ingredients or dimensions change
  useEffect(() => {
    if (!isImageLoaded || !detectedIngredients || detectedIngredients.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // First, redraw the image to clear previous boxes
    const image = new Image();
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      // Define a broader range of contrasting colors for better differentiation
      const colors = [
        'rgba(255, 99, 132, 0.7)',    // Red
        'rgba(54, 162, 235, 0.7)',    // Blue
        'rgba(255, 206, 86, 0.7)',    // Yellow
        'rgba(75, 192, 192, 0.7)',    // Teal
        'rgba(153, 102, 255, 0.7)',   // Purple
        'rgba(255, 159, 64, 0.7)',    // Orange
        'rgba(0, 204, 102, 0.7)',     // Green
        'rgba(255, 51, 204, 0.7)',    // Pink
        'rgba(102, 255, 255, 0.7)',   // Cyan
        'rgba(255, 102, 0, 0.7)',     // Deep Orange
        'rgba(102, 0, 204, 0.7)',     // Indigo
        'rgba(0, 153, 0, 0.7)'        // Dark Green
      ];
      
      // First, draw the boxes without the hover effect
      detectedIngredients.forEach((ingredient, index) => {
        if (index === hoveredIndex) return; // Skip hovered ingredient to draw last (on top)
        
        const { boundingBox } = ingredient;
        if (!boundingBox) return;
        
        drawIngredientBox(ctx, canvas, ingredient, index, colors, false);
      });
      
      // Then draw the hovered box (if any) on top to ensure it's visible
      if (hoveredIndex !== null && detectedIngredients[hoveredIndex]?.boundingBox) {
        drawIngredientBox(ctx, canvas, detectedIngredients[hoveredIndex], hoveredIndex, colors, true);
      }
    };
    
    image.src = imageSrc;
  }, [detectedIngredients, imageSrc, isImageLoaded, imageDimensions, hoveredIndex]);
  
  // Helper function to draw ingredient boxes with consistent styling
  const drawIngredientBox = (ctx, canvas, ingredient, index, colors, isHovered) => {
    const { boundingBox } = ingredient;
    const { x, y, width, height } = boundingBox;
    
    // Calculate actual pixel coordinates based on canvas size
    const boxX = x * canvas.width;
    const boxY = y * canvas.height;
    const boxWidth = width * canvas.width;
    const boxHeight = height * canvas.height;
    
    // Get base color
    const color = colors[index % colors.length];
    
    // Create a more visible pattern for overlapping boxes
    const opacity = isHovered ? 0.8 : 0.4;
    const dashedBorder = isHovered;
    const lineWidth = isHovered ? 4 : 2;
    
    // Extract the RGB part of the color
    const rgbPart = color.substring(0, color.lastIndexOf(','));
    const boxColor = `${rgbPart}, ${opacity})`;
    const borderColor = color.replace('0.7', '1.0'); // Full opacity for border
    
    // Draw box with pattern if hovered
    ctx.fillStyle = boxColor;
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    
    // Draw border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = lineWidth;
    
    if (dashedBorder) {
      ctx.setLineDash([5, 3]);
    } else {
      ctx.setLineDash([]);
    }
    
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    ctx.setLineDash([]);
    
    // Draw label - position it differently based on position to avoid overlap
    // For boxes near the top, put label below
    const textY = y < 0.2 ? boxY + boxHeight + 20 : boxY - 5;
    
    // Create a background for the text to improve readability
    const textWidth = ctx.measureText(ingredient.name).width + 10;
    const textHeight = 20;
    
    ctx.fillStyle = borderColor;
    ctx.fillRect(boxX, textY - textHeight + 5, textWidth, textHeight);
    
    ctx.fillStyle = 'white';
    ctx.font = isHovered ? 'bold 16px Arial' : '14px Arial';
    ctx.fillText(ingredient.name, boxX + 5, textY);
  };
  
  // Track mouse position to detect hovering over bounding boxes
  const handleMouseMove = (e) => {
    if (!isImageLoaded || !detectedIngredients || detectedIngredients.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
    const mouseY = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
    
    // Check if mouse is over any bounding box
    let hoveredIng = null;
    
    for (let i = 0; i < detectedIngredients.length; i++) {
      const { boundingBox } = detectedIngredients[i];
      if (!boundingBox) continue;
      
      const { x, y, width, height } = boundingBox;
      const boxX = x * canvas.width;
      const boxY = y * canvas.height;
      const boxWidth = width * canvas.width;
      const boxHeight = height * canvas.height;
      
      if (
        mouseX >= boxX && 
        mouseX <= boxX + boxWidth && 
        mouseY >= boxY && 
        mouseY <= boxY + boxHeight
      ) {
        hoveredIng = i;
        // Prioritize the smallest area when boxes overlap
        if (hoveredIng !== null) {
          const currentArea = boundingBox.width * boundingBox.height;
          const prevArea = detectedIngredients[hoveredIng].boundingBox.width * 
                         detectedIngredients[hoveredIng].boundingBox.height;
          
          if (currentArea < prevArea) {
            hoveredIng = i;
          }
        }
      }
    }
    
    setHoveredIndex(hoveredIng);
  };
  
  return (
    <div 
      ref={containerRef}
      className="w-full flex flex-col items-center bg-[#13131f] rounded-lg p-2 overflow-hidden"
    >
      {/* Control panel */}
      {imageSrc && (
        <div className="w-full flex justify-between mb-2">
          <div className="flex gap-2">
            <button 
              onClick={handleZoomOut} 
              className="p-2 bg-purple-800 text-white rounded hover:bg-purple-700 transition"
              title="Zoom Out"
            >
              -
            </button>
            <button 
              onClick={handleZoomIn} 
              className="p-2 bg-purple-800 text-white rounded hover:bg-purple-700 transition"
              title="Zoom In"
            >
              +
            </button>
            <span className="p-2 bg-purple-900 text-white rounded">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>
          <button 
            onClick={toggleModal} 
            className="p-2 bg-purple-800 text-white rounded hover:bg-purple-700 transition"
            title={isModalOpen ? "Close expanded view" : "Open expanded view"}
          >
            {isModalOpen ? "Close" : "Expand"}
          </button>
        </div>
      )}
      
      {/* Regular canvas container with zoom applied */}
      {!isModalOpen && (
        <div className="w-full flex justify-center items-center overflow-auto">
          {imageSrc ? (
            <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center top', transition: 'transform 0.2s ease' }}>
              <canvas 
                ref={canvasRef} 
                className="rounded border border-purple-700/50"
                onMouseMove={handleMouseMove}
                onWheel={handleWheel}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </div>
          ) : (
            <div className="w-full h-[250px] flex items-center justify-center text-gray-500">
              Select an image to detect ingredients
            </div>
          )}
        </div>
      )}
      
      {/* Modal view for expanded image */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={toggleModal}>
          <div 
            className="relative max-w-[90vw] max-h-[90vh] overflow-auto p-4 bg-[#13131f] rounded-lg"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <button
              className="absolute top-2 right-2 p-2 bg-purple-800 text-white rounded hover:bg-purple-700 transition z-10"
              onClick={toggleModal}
            >
              Close
            </button>
            
            <div 
              className="overflow-auto" 
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}
            >
              <canvas 
                ref={canvasRef} 
                className="rounded border border-purple-700/50"
                onMouseMove={handleMouseMove}
                onWheel={handleWheel}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </div>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/70 p-2 rounded">
              <button 
                onClick={handleZoomOut} 
                className="p-2 bg-purple-800 text-white rounded hover:bg-purple-700 transition"
              >
                -
              </button>
              <span className="p-2 bg-purple-900 text-white rounded">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button 
                onClick={handleZoomIn} 
                className="p-2 bg-purple-800 text-white rounded hover:bg-purple-700 transition"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Image information */}
      {isImageLoaded && imageDimensions.width > 0 && !isModalOpen && (
        <div className="mt-2 text-xs text-gray-400">
          Original size: {imageDimensions.width} x {imageDimensions.height}px • Use mouse wheel to zoom
        </div>
      )}
    </div>
  );
};

export default IngredientDetectionCanvas;
