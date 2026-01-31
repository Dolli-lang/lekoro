import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";

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

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  }, [currentIndex]);

  const goNext = useCallback(() => {
    if (currentIndex < images.length - 1) setCurrentIndex(prev => prev + 1);
  }, [currentIndex, images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, goPrev, goNext, onClose]);

  if (!isOpen || images.length === 0) return null;

  const content = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000",
        zIndex: 2147483647,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      {/* Header bar - compact */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          zIndex: 10
        }}
      >
        <span
          style={{
            color: "#fff",
            fontSize: "13px",
            background: "rgba(0,0,0,0.5)",
            padding: "5px 12px",
            borderRadius: "16px"
          }}
        >
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          <X size={22} />
        </button>
      </div>

      {/* Main image area - full screen */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          width: "100%",
          height: "100%"
        }}
      >
        {/* Previous button - transparent */}
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            style={{
              position: "absolute",
              left: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.3)",
              border: "none",
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              cursor: "pointer",
              zIndex: 10
            }}
          >
            <ChevronLeft size={26} />
          </button>
        )}

        {/* Image - plein écran */}
        <img
          key={`img-${currentIndex}`}
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block"
          }}
          draggable={false}
        />

        {/* Next button - transparent */}
        {currentIndex < images.length - 1 && (
          <button
            onClick={goNext}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.3)",
              border: "none",
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              cursor: "pointer",
              zIndex: 10
            }}
          >
            <ChevronRight size={26} />
          </button>
        )}
      </div>

      {/* Thumbnails - bottom overlay */}
      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "6px",
            background: "rgba(0,0,0,0.5)",
            padding: "6px 10px",
            borderRadius: "12px",
            zIndex: 10
          }}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "4px",
                overflow: "hidden",
                border: idx === currentIndex ? "2px solid #fff" : "2px solid transparent",
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

  // Use portal to render at document body level
  return createPortal(content, document.body);
};
