'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Wine, Image as ImageIcon, X } from 'lucide-react';
import PurpleButton from './PurpleButton';

/**
 * Component for handling image selection from different sources.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onImageSelected - Function called when an image is selected
 * @param {boolean} props.isLoading - Loading state
 */
const ImageUploader = ({ onImageSelected, isLoading }) => {  const fileInputRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDemoImages, setShowDemoImages] = useState(false);
  

  const demoImages = [
    // These are example entries - add your actual image filenames here
    { name: 'Liquor Sampler', path: '/demoImages/sampler.png' },
    { name: 'Liquor Sampler', path: '/demoImages/sampler2.png' },
    { name: 'Liquor Sampler', path: '/demoImages/sampler3.jpg' },
    { name: 'Titos', path: '/demoImages/titos.jpg' },
    { name: 'Tupac', path: '/demoImages/Tupac.webp' },
    { name: 'Liquor Sampler', path: '/demoImages/sampler4.jpg' },
    { name: 'Juices', path: '/demoImages/Juices.webp' },
    { name: 'Fruits', path: '/demoImages/Fruits.jpg' },
    { name: 'Soda', path: '/demoImages/Soda.jpg' },
    { name: 'Soda', path: '/demoImages/Soda2.jpg' },
  ];

  // Close demo image gallery when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDemoImages && !event.target.closest('.demo-images-container')) {
        setShowDemoImages(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDemoImages]);

  // Handle file selection
  const handleFileChange = (e) => {
    setErrorMessage('');
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file');
      return;
    }

    // Max file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onImageSelected(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Toggle demo image gallery
  const toggleDemoImages = () => {
    setShowDemoImages(!showDemoImages);
  };
  // Handle demo image selection
  const handleDemoImageSelect = (imagePath) => {
    // For demo images, we need to convert the path to a data URL
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // CORS workaround
    img.onload = () => {
      // Create a canvas to draw the image
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0);
      
      // Convert to data URL
      try {
        const dataUrl = canvas.toDataURL('image/jpeg');
        onImageSelected(dataUrl);
      } catch (error) {
        console.error('Error converting image to data URL:', error);
        setErrorMessage('Error loading demo image. Please try another one.');
      }
    };
    
    img.onerror = () => {
      console.error('Error loading image:', imagePath);
      setErrorMessage('Error loading demo image. Please try another one.');
    };
    
    img.src = imagePath;
    setShowDemoImages(false);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* File upload button */}
        <div className="relative flex justify-center md:justify-start">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={isLoading}
          />
          <PurpleButton
            onClick={() => fileInputRef.current.click()}
            disabled={isLoading}
          >
            <Upload size={16} />
            <span>Upload Image</span>
          </PurpleButton>
        </div>

        {/* Camera capture button (only on supported devices) */}
        <div className="relative flex justify-center">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />
          <PurpleButton disabled={isLoading}>
            <Camera size={16} />
            <span>Take Photo</span>
          </PurpleButton>
        </div>

        {/* Demo image button */}
        <div className="relative flex justify-center md:justify-end">
          <PurpleButton
            onClick={toggleDemoImages}
            disabled={isLoading}
          >
            <Wine size={16} />
            <span>Demo Images</span>
          </PurpleButton>
        </div>
      </div>
      {/* Demo Images Gallery */}
      {showDemoImages && (
        <div className="demo-images-container relative bg-[#1a1a2e]/90 p-4 rounded-lg mt-2 border border-purple-800/50 shadow-lg">
          <button 
            onClick={() => setShowDemoImages(false)}
            className="absolute top-2 right-2 text-purple-300 hover:text-white p-1 rounded-full hover:bg-purple-800/50"
          >
            <X size={16} />
          </button>
          <h3 className="text-white font-medium mb-3 pl-1">Select a Demo Image</h3>
          
          {demoImages.length === 0 ? (
            <p className="text-purple-300 text-center py-4">No demo images found</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {demoImages.map((image, index) => (
                <div 
                  key={index}
                  onClick={() => handleDemoImageSelect(image.path)}
                  className="cursor-pointer bg-[#232342]/70 rounded-lg p-2 hover:bg-purple-900/50 transition-colors flex flex-col items-center"
                >
                  <div className="w-full h-24 relative overflow-hidden rounded border border-purple-700/30">
                    {/* Display actual image instead of placeholder */}
                    <img 
                      src={image.path} 
                      alt={image.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = '/demoImages/sampler.png'; // Fallback image
                      }}
                    />
                    <ImageIcon className="fallback-icon absolute inset-0 m-auto text-purple-400/50 hidden" />
                  </div>
                  <p className="text-purple-200 text-sm mt-2 text-center">
                    {image.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="text-red-400 text-sm mt-2">{errorMessage}</div>
      )}
    </div>
  );
};

export default ImageUploader;
