import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

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
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) setCurrentIndex(currentIndex - 1);
      if (e.key === "ArrowRight" && currentIndex < images.length - 1) setCurrentIndex(currentIndex + 1);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, currentIndex, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goNext = () => {
    if (currentIndex < images.length - 1) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      {/* Close button */}
      <button 
        className="lightbox-close"
        onClick={onClose}
        aria-label="Fermer"
      >
        <X size={28} />
      </button>

      {/* Counter */}
      <div className="lightbox-counter">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Main image container */}
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="lightbox-image"
          draggable={false}
        />
      </div>

      {/* Navigation - Previous */}
      {currentIndex > 0 && (
        <button 
          className="lightbox-nav lightbox-nav-prev"
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          aria-label="Image précédente"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {/* Navigation - Next */}
      {currentIndex < images.length - 1 && (
        <button 
          className="lightbox-nav lightbox-nav-next"
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          aria-label="Image suivante"
        >
          <ChevronRight size={32} />
        </button>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="lightbox-thumbnails" onClick={(e) => e.stopPropagation()}>
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`lightbox-thumb ${idx === currentIndex ? 'lightbox-thumb-active' : ''}`}
            >
              <img src={img} alt={`Miniature ${idx + 1}`} draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
