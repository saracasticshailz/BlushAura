import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Button } from '../atoms/Button';

export function MotionRibbon() {
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  return (
    <div className="ritual-ribbon" role="region" aria-label="Slow down. Tune in. Feel good.">
      <div
        aria-hidden="true"
        style={{ animationPlayState: paused || reduced ? 'paused' : 'running' }}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i}>
            SLOW DOWN <i>✦</i> TUNE IN <i>✦</i> FEEL GOOD <i>✦</i> A LITTLE MORE YOU <i>✦</i>
          </span>
        ))}
      </div>
      {!reduced && (
        <Button
          className="ribbon-pause"
          aria-label={paused ? 'Start moving text' : 'Pause moving text'}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </Button>
      )}
    </div>
  );
}
