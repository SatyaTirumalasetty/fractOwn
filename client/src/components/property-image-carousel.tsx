import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface PropertyImageCarouselProps {
  images: string[];
  propertyName: string;
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export function PropertyImageCarousel({
  images,
  propertyName,
  isOpen,
  onClose,
  initialIndex = 0
}: PropertyImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0" data-testid="property-image-carousel" aria-describedby="carousel-description">
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            data-testid="button-close-carousel"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Property Name */}
          <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded">
            <h3 className="font-medium" data-testid="text-property-name">{propertyName}</h3>
            <p id="carousel-description" className="text-sm opacity-90" data-testid="text-image-counter">
              {currentIndex + 1} of {images.length}
            </p>
          </div>

          {/* Main Image */}
          <img
            src={images[currentIndex]}
            alt={`${propertyName} - Image ${currentIndex + 1}`}
            data-testid={`img-property-main-${currentIndex}`}
            className="w-full h-full object-cover"
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                data-testid="button-previous-image"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                data-testid="button-next-image"
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg">
              {images.map((image, index) => (
                <button
                  key={index}
                  data-testid={`button-thumbnail-${index}`}
                  onClick={() => goToSlide(index)}
                  className={`w-12 h-8 rounded overflow-hidden border-2 transition-all ${
                    index === currentIndex 
                      ? "border-white scale-110" 
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    data-testid={`img-thumbnail-${index}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Keyboard Navigation Hint */}
          <div className="absolute bottom-16 right-4 text-white/70 text-sm bg-black/30 px-2 py-1 rounded">
            Use ← → keys to navigate
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Keyboard navigation hook
export function useKeyboardNavigation(
  isOpen: boolean,
  onPrevious: () => void,
  onNext: () => void,
  onClose: () => void
) {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          onPrevious();
          break;
        case "ArrowRight":
          event.preventDefault();
          onNext();
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onPrevious, onNext, onClose]);
}