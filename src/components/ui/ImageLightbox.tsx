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
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) setCurrentIndex(prev => prev - 1);
      if (e.key === "ArrowRight" && currentIndex < images.length - 1) setCurrentIndex(prev => prev + 1);
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, currentIndex, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentIndex < images.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleThumbClick = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(idx);
  };

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#000",
        zIndex: 999999,
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        flexShrink: 0
      }}>
        <span style={{
          color: "#fff",
          fontSize: "14px",
          background: "rgba(255,255,255,0.15)",
          padding: "6px 14px",
          borderRadius: "20px"
        }}>
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={handleClose}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "none",
            borderRadius: "50%",
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Image area */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        minHeight: 0
      }}>
        {/* Prev button */}
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            style={{
              position: "absolute",
              left: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              cursor: "pointer",
              zIndex: 10
            }}
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {/* Image */}
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          style={{
            maxWidth: "calc(100% - 120px)",
            maxHeight: "100%",
            objectFit: "contain",
            display: "block"
          }}
          draggable={false}
        />

        {/* Next button */}
        {currentIndex < images.length - 1 && (
          <button
            onClick={goNext}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              cursor: "pointer",
              zIndex: 10
            }}
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          padding: "12px",
          gap: "8px",
          overflowX: "auto",
          flexShrink: 0
        }}>
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => handleThumbClick(e, idx)}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "6px",
                overflow: "hidden",
                border: idx === currentIndex ? "2px solid #3b82f6" : "2px solid transparent",
                padding: 0,
                background: "none",
                cursor: "pointer",
                opacity: idx === currentIndex ? 1 : 0.5,
                flexShrink: 0
              }}
            >
              <img
                src={img}
                alt={`Miniature ${idx + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
