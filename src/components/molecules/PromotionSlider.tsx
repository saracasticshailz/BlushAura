import { useEffect, useState } from 'react';
import { Package, Truck } from 'lucide-react';

const slides = [
  {
    label: 'A LITTLE TREAT, ON US',
    title: 'Free shipping',
    detail: 'On orders of ₹1,999 and above.',
    Icon: Truck,
  },
  {
    label: 'A LITTLE EXTRA CARE',
    title: 'Thoughtfully packed',
    detail: 'Discreetly delivered, just for you.',
    Icon: Package,
  },
];

export function PromotionSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (paused || motion.matches) return;
    const timer = window.setInterval(
      () => setCurrent((index) => (index + 1) % slides.length),
      6000,
    );
    return () => window.clearInterval(timer);
  }, [paused]);
  const { label, title, detail, Icon } = slides[current];
  return (
    <div
      className="story-art promotion-slider"
      role="region"
      aria-roledescription="carousel"
      aria-label="Store promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div
        className="promotion-slide"
        aria-live="off"
        aria-label={`Slide ${current + 1} of ${slides.length}`}
      >
        <div className="orb orb1" />
        <div className="orb orb2" />
        <Icon className="promotion-icon" size={68} strokeWidth={1} aria-hidden="true" />
        <div className="promotion-copy">
          <span>{label}</span>
          <h2>{title}</h2>
          <p>{detail}</p>
        </div>
      </div>
      <div className="promotion-controls" aria-label="Choose promotion">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Show ${slide.title}`}
            aria-pressed={index === current}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
}
