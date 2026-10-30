import { useRef, type PointerEvent } from 'react';

export type CropBox = { x: number; y: number; width: number; height: number };
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export function centeredCrop(
  sourceWidth: number,
  sourceHeight: number,
  aspect: number | null,
): CropBox {
  if (!aspect) return { x: 0, y: 0, width: 100, height: 100 };
  const width = Math.min(sourceWidth, sourceHeight * aspect);
  const height = width / aspect;
  return {
    x: (1 - width / sourceWidth) * 50,
    y: (1 - height / sourceHeight) * 50,
    width: (width / sourceWidth) * 100,
    height: (height / sourceHeight) * 100,
  };
}

export function CropSelector({
  source,
  sourceWidth,
  sourceHeight,
  crop,
  aspect,
  disabled,
  onChange,
}: {
  source: string;
  sourceWidth: number;
  sourceHeight: number;
  crop: CropBox;
  aspect: number | null;
  disabled: boolean;
  onChange: (crop: CropBox) => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    crop: CropBox;
    mode: string;
    width: number;
    height: number;
  } | null>(null);
  function start(e: PointerEvent, mode: string) {
    if (disabled || !stage.current) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = stage.current.getBoundingClientRect();
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      crop: { ...crop },
      mode,
      width: rect.width,
      height: rect.height,
    };
    stage.current.setPointerCapture(e.pointerId);
  }
  function move(e: PointerEvent) {
    const state = drag.current;
    if (!state || disabled) return;
    const dx = ((e.clientX - state.x) / state.width) * 100;
    const dy = ((e.clientY - state.y) / state.height) * 100;
    const box = state.crop;
    if (state.mode === 'move') {
      onChange({
        ...box,
        x: clamp(box.x + dx, 0, 100 - box.width),
        y: clamp(box.y + dy, 0, 100 - box.height),
      });
      return;
    }
    const left = state.mode.includes('w'),
      top = state.mode.includes('n');
    const availableWidth = left ? box.x + box.width : 100 - box.x;
    const availableHeight = top ? box.y + box.height : 100 - box.y;
    let width = clamp(box.width + (left ? -dx : dx), 2, availableWidth);
    let height = clamp(box.height + (top ? -dy : dy), 2, availableHeight);
    if (aspect) {
      const relativeAspect = (aspect * sourceHeight) / sourceWidth;
      const delta =
        Math.abs(dx) >= Math.abs(dy * relativeAspect)
          ? left
            ? -dx
            : dx
          : (top ? -dy : dy) * relativeAspect;
      const maximum = Math.min(availableWidth, availableHeight * relativeAspect);
      width = clamp(box.width + delta, Math.min(maximum, Math.max(2, 2 * relativeAspect)), maximum);
      height = width / relativeAspect;
    }
    onChange({
      x: left ? box.x + box.width - width : box.x,
      y: top ? box.y + box.height - height : box.y,
      width,
      height,
    });
  }
  return (
    <div className="crop-source-wrap">
      <div
        ref={stage}
        className="crop-source"
        style={{
          aspectRatio: `${sourceWidth} / ${sourceHeight}`,
          width: `min(100%, calc(min(440px, 52vh) * ${sourceWidth / sourceHeight}))`,
        }}
        onPointerMove={move}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <img src={source} alt="Original image with crop selection" draggable={false} />
        <div
          className="crop-selection"
          role="group"
          aria-label="Crop selection"
          style={{
            left: `${crop.x}%`,
            top: `${crop.y}%`,
            width: `${crop.width}%`,
            height: `${crop.height}%`,
          }}
          onPointerDown={(e) => start(e, 'move')}
        >
          <div className="crop-thirds" />
          <button
            type="button"
            className="crop-move-keyboard"
            aria-label="Move crop area with arrow keys"
            disabled={disabled}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 5 : 1;
              if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
              e.preventDefault();
              onChange({
                ...crop,
                x: clamp(
                  crop.x + (e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0),
                  0,
                  100 - crop.width,
                ),
                y: clamp(
                  crop.y + (e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0),
                  0,
                  100 - crop.height,
                ),
              });
            }}
          />
          {['nw', 'ne', 'sw', 'se'].map((corner) => (
            <button
              type="button"
              key={corner}
              className={`crop-handle ${corner}`}
              aria-label={`Resize crop ${corner}`}
              disabled={disabled}
              onPointerDown={(e) => start(e, corner)}
            />
          ))}
        </div>
      </div>
      <p>Drag inside to move. Drag a corner to crop.</p>
    </div>
  );
}
