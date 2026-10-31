import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { ProductMedia } from '../../types/product';

export function MediaFrame({
  media,
  fallback,
  autoPlay = false,
  poster,
  loop = true,
  onEnded,
}: {
  media?: ProductMedia;
  fallback?: ReactNode;
  autoPlay?: boolean;
  poster?: string;
  loop?: boolean;
  onEnded?: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [media?.url]);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    let visible = false;
    const sync = () => {
      if (autoPlay && !reduced && visible && !document.hidden) void element.play().catch(() => {});
      else element.pause();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
        sync();
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(element);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      element.pause();
    };
  }, [autoPlay, reduced, media?.url, failed]);
  if (!media || failed)
    return (
      <div className="media-fallback">
        {fallback}
        {failed && <span className="media-error">Media unavailable</span>}
      </div>
    );
  return media.type === 'video' ? (
    <video
      ref={video}
      src={media.url}
      poster={poster}
      className="media-video"
      controls
      muted
      playsInline
      loop={loop}
      onEnded={onEnded}
      preload="metadata"
      aria-label={media.caption || 'Product video'}
      onError={() => setFailed(true)}
    />
  ) : (
    <img
      src={media.url}
      alt={media.caption || 'Product image'}
      className="media-photo"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
