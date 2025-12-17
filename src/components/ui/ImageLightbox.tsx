import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageLightbox = ({ images, initialIndex, isOpen, onClose }: ImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
  }, [onClose, handlePrevious, handleNext]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black flex flex-col"
      style={{ zIndex: 999999 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-3 shrink-0">
        <div className="text-white text-sm font-medium bg-white/10 px-3 py-1.5 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 rounded-full h-10 w-10"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Main content - image fills available space */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-4">
        {/* Navigation buttons */}
        {images.length > 1 && (
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 text-white w-12 h-12 rounded-full z-10 flex items-center justify-center"
            onClick={handlePrevious}
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        )}

        <img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-[95vw] max-h-[85vh] w-auto h-auto object-contain select-none pointer-events-none"
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
        />

        {images.length > 1 && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 text-white w-12 h-12 rounded-full z-10 flex items-center justify-center"
            onClick={handleNext}
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="py-3 px-4 shrink-0 flex justify-center">
          <div className="flex gap-2 overflow-x-auto max-w-full">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                  idx === currentIndex 
                    ? "border-primary ring-2 ring-primary/50 scale-110" 
                    : "border-transparent opacity-50 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`Miniature ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
