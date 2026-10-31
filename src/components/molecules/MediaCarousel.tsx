import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { ProductMedia } from '../../types/product';
import { Button } from '../atoms/Button';
import { MediaFrame } from '../atoms/MediaFrame';

export type MediaSlide = {
  id: string;
  media?: ProductMedia;
  fallback?: ReactNode;
  label: string;
  poster?: string;
};
export function MediaCarousel({
  slides,
  label,
  className = '',
  autoPlay = true,
  thumbnails = false,
}: {
  slides: MediaSlide[];
  label: string;
  className?: string;
  autoPlay?: boolean;
  thumbnails?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [visible, setVisible] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);
  const reduced = useReducedMotion();
  const current = slides[index % slides.length];
  const move = (delta: number) =>
    setIndex((value) => (value + delta + slides.length) % slides.length);
  useEffect(() => {
    if (!container.current) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.3,
    });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (
      !autoPlay ||
      reduced ||
      paused ||
      interacting ||
      !visible ||
      slides.length < 2 ||
      current?.media?.type === 'video'
    )
      return;
    const timer = window.setInterval(() => {
      if (!document.hidden) move(1);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [autoPlay, reduced, paused, interacting, visible, index, slides.length, current?.media?.type]);
  if (!current) return null;
  return (
    <div
      ref={container}
      className={`media-carousel ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
      }}
      onTouchStart={(event) => {
        if (event.target instanceof HTMLVideoElement) {
          touchStart.current = null;
          return;
        }
        touchStart.current = event.touches[0].clientX;
        setInteracting(true);
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        if (start !== null && Math.abs(event.changedTouches[0].clientX - start) > 45)
          move(event.changedTouches[0].clientX < start ? 1 : -1);
        touchStart.current = null;
        setInteracting(false);
      }}
      onKeyDown={(event) => {
        if (event.target instanceof HTMLVideoElement) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          move(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      <div
        key={current.id}
        className={`carousel-stage ${current.media?.type === 'video' ? 'is-video' : ''}`}
        role="group"
        aria-roledescription="slide"
        aria-label={`${(index % slides.length) + 1} of ${slides.length}: ${current.label}`}
      >
        <MediaFrame
          media={current.media}
          fallback={current.fallback}
          autoPlay={autoPlay && !paused}
          poster={current.poster}
          loop={false}
          onEnded={() => {
            if (autoPlay && !paused && !reduced && !interacting) move(1);
          }}
        />
      </div>
      <div className="carousel-caption">
        <span>{current.label}</span>
        <span>
          {String((index % slides.length) + 1).padStart(2, '0')} /{' '}
          {String(slides.length).padStart(2, '0')}
        </span>
      </div>
      {slides.length > 1 && (
        <div className="carousel-toolbar">
          <Button
            aria-label={`Previous slide in ${label}`}
            className="carousel-arrow"
            onClick={() => move(-1)}
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="carousel-dots">
            {slides.map((slide, i) => (
              <Button
                key={slide.id}
                aria-label={`Show slide ${i + 1}: ${slide.label}`}
                aria-current={i === index % slides.length ? 'true' : undefined}
                className={i === index % slides.length ? 'active' : ''}
                onClick={() => setIndex(i)}
              >
                <span />
              </Button>
            ))}
          </div>
          {autoPlay && !reduced && (
            <Button
              className="carousel-arrow"
              aria-label={paused ? `Start ${label} slideshow` : `Pause ${label} slideshow`}
              onClick={() => setPaused(!paused)}
            >
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </Button>
          )}
          <Button
            aria-label={`Next slide in ${label}`}
            className="carousel-arrow"
            onClick={() => move(1)}
          >
            <ArrowRight size={18} />
          </Button>
        </div>
      )}
      {thumbnails && slides.length > 1 && (
        <div className="carousel-thumbnails" aria-label="Product media thumbnails">
          {slides.map((slide, i) => (
            <Button
              key={slide.id}
              className={i === index % slides.length ? 'active' : ''}
              aria-label={`View media ${i + 1}: ${slide.label}`}
              aria-pressed={i === index % slides.length}
              onClick={() => setIndex(i)}
            >
              {slide.media?.type === 'image' ? (
                <img src={slide.media.url} alt="" />
              ) : slide.media?.type === 'video' ? (
                <Play size={20} />
              ) : (
                slide.fallback
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
