import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PropertyCarouselProps {
  images: string[];
  onImageClick?: () => void;
  className?: string;
}

export function PropertyCarousel({ images, onImageClick, className = "" }: PropertyCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className={`w-full h-full bg-secondary/50 flex items-center justify-center ${className}`}>
        <span className="text-xs text-muted-foreground">Sem foto</span>
      </div>
    );
  }

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={`relative w-full h-full group overflow-hidden ${className}`} onClick={onImageClick}>
      <img
        key={currentIndex}
        src={images[currentIndex]}
        alt=""
        className="w-full h-full object-cover transition-opacity duration-300"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={16} className="text-white" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={16} className="text-white" />
          </button>

          {/* Instagram-style indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
