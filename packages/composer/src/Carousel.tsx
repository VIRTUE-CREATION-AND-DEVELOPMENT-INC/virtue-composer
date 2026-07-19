"use client";

import type { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import Button from "./Button";

export type CarouselSlide = { id: string; content: ReactNode; label?: string };
export type CarouselProps = { slides: CarouselSlide[]; options?: EmblaOptionsType; ariaLabel?: string; previousLabel?: string; nextLabel?: string; showIndicators?: boolean; className?: string };

export default function Carousel({ slides, options, ariaLabel = "Carousel", previousLabel = "Previous slide", nextLabel = "Next slide", showIndicators = true, className }: CarouselProps) {
  const [viewportRef, api] = useEmblaCarousel(options);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const sync = useCallback(() => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
    setCanScrollPrevious(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    sync();
    api.on("select", sync).on("reInit", sync);
    return () => { api.off("select", sync).off("reInit", sync); };
  }, [api, sync]);

  return (
    <section aria-roledescription="carousel" aria-label={ariaLabel} className={className} data-vc-component="carousel">
      <div ref={viewportRef} data-vc-carousel-viewport>
        <div data-vc-carousel-track>
          {slides.map((slide, index) => <div key={slide.id} role="group" aria-roledescription="slide" aria-label={slide.label ?? `${index + 1} of ${slides.length}`} data-vc-carousel-slide>{slide.content}</div>)}
        </div>
      </div>
      <div data-vc-carousel-controls>
        <Button aria-label={previousLabel} disabled={!canScrollPrevious} onClick={() => api?.scrollPrev()}>{previousLabel}</Button>
        {showIndicators && <div role="group" aria-label="Choose slide" data-vc-carousel-indicators>{slides.map((slide, index) => <Button key={slide.id} aria-label={`Go to slide ${index + 1}`} aria-current={index === selectedIndex ? "true" : undefined} onClick={() => api?.scrollTo(index)}>{index + 1}</Button>)}</div>}
        <Button aria-label={nextLabel} disabled={!canScrollNext} onClick={() => api?.scrollNext()}>{nextLabel}</Button>
      </div>
    </section>
  );
}
