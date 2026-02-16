import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: string[];
  className?: string;
  aspectRatio?: string;
}

export function ImageCarousel({ images, className, aspectRatio = "aspect-video" }: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  if (images.length === 0) {
    return (
      <div className={cn("rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground text-sm", aspectRatio, className)}>
        Sem fotos
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={cn("rounded-lg overflow-hidden neon-border", className)}>
        <img src={images[0]} alt="Imóvel" className={cn("w-full object-cover", aspectRatio)} />
      </div>
    );
  }

  return (
    <div className={cn("relative group", className)}>
      <div ref={emblaRef} className="overflow-hidden rounded-lg neon-border">
        <div className="flex">
          {images.map((src, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0">
              <img src={src} alt={`Foto ${i + 1}`} className={cn("w-full object-cover", aspectRatio)} />
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      {canScrollPrev && (
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 backdrop-blur-sm border border-primary/30 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      {canScrollNext && (
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 backdrop-blur-sm border border-primary/30 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              i === selectedIndex
                ? "bg-primary shadow-[0_0_6px_hsl(183_100%_50%/0.6)] scale-125"
                : "bg-foreground/30 hover:bg-foreground/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
