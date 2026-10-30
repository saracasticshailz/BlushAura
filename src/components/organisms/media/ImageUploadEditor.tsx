import { Check, Crop, ImagePlus, RotateCcw, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { CropSelector, centeredCrop, type CropBox } from '../../molecules/CropSelector';

export type ImageSize = { width: number; height: number; scale: number; crop?: CropBox };
const presets = {
  square: { width: 1200, height: 1200 },
  portrait: { width: 960, height: 1200 },
  landscape: { width: 1200, height: 900 },
};
type Shape = keyof typeof presets | 'original' | 'free';

export function ImageUploadEditor({
  file,
  busy,
  onClose,
  onApply,
}: {
  file: File;
  busy: boolean;
  onClose: () => void;
  onApply: (file: File, size: ImageSize) => Promise<void>;
}) {
  const [source, setSource] = useState('');
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [cropEnabled, setCropEnabled] = useState(true);
  const [crop, setCrop] = useState<CropBox>({ x: 0, y: 0, width: 100, height: 100 });
  const [shape, setShape] = useState<Shape>('square');
  const [scale, setScale] = useState(100);
  const [error, setError] = useState('');
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    let active = true;
    image.onload = () => {
      if (!active) return;
      if (
        image.naturalWidth > 6000 ||
        image.naturalHeight > 6000 ||
        image.naturalWidth * image.naturalHeight > 16000000
      ) {
        setError('Use an image up to 16 megapixels and 6000 pixels per side.');
        return;
      }
      setNatural({ width: image.naturalWidth, height: image.naturalHeight });
      setCrop(centeredCrop(image.naturalWidth, image.naturalHeight, 1));
      setSource(url);
    };
    image.onerror = () => {
      if (active) setError('This image could not be opened. Choose another JPEG or PNG.');
    };
    image.src = url;
    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
      URL.revokeObjectURL(url);
    };
  }, [file]);
  const aspect =
    shape === 'free'
      ? null
      : shape === 'original'
        ? natural.width / natural.height
        : presets[shape].width / presets[shape].height;
  const x = Math.max(0, Math.round((natural.width * crop.x) / 100));
  const y = Math.max(0, Math.round((natural.height * crop.y) / 100));
  const cropPixels = {
    x,
    y,
    width: Math.max(1, Math.min(natural.width - x, Math.round((natural.width * crop.width) / 100))),
    height: Math.max(
      1,
      Math.min(natural.height - y, Math.round((natural.height * crop.height) / 100)),
    ),
  };
  const frame = cropEnabled ? cropPixels : { x: 0, y: 0, ...natural };
  let output =
    shape === 'free' || shape === 'original'
      ? {
          width: Math.max(200, Math.round(1200 * Math.min(1, frame.width / frame.height))),
          height: Math.max(200, Math.round(1200 * Math.min(1, frame.height / frame.width))),
        }
      : presets[shape];
  if (!natural.width) output = presets.square;
  const ratio = natural.width
    ? (Math.min(output.width / frame.width, output.height / frame.height) * scale) / 100
    : 0;
  function chooseShape(value: Shape) {
    setShape(value);
    const nextAspect =
      value === 'free'
        ? null
        : value === 'original'
          ? natural.width / natural.height
          : presets[value].width / presets[value].height;
    setCrop(centeredCrop(natural.width || 1, natural.height || 1, nextAspect));
  }
  async function apply(e: FormEvent) {
    e.preventDefault();
    if (!natural.width || busy) return;
    setError('');
    try {
      await onApply(file, { ...output, scale, ...(cropEnabled ? { crop: cropPixels } : {}) });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The image could not be uploaded.');
    }
  }
  const finalPreview = (
    <div className="image-resize-preview-wrap">
      <div
        className="image-resize-preview"
        style={{
          aspectRatio: `${output.width} / ${output.height}`,
          width: `min(100%, ${((cropEnabled ? 110 : 320) * output.width) / output.height}px)`,
        }}
      >
        {!!source && (
          <div
            className="crop-output-frame"
            style={{
              width: `${((frame.width * ratio) / output.width) * 100}%`,
              height: `${((frame.height * ratio) / output.height) * 100}%`,
            }}
          >
            <img
              src={source}
              alt="Product image final preview"
              style={{
                width: `${(natural.width / frame.width) * 100}%`,
                height: `${(natural.height / frame.height) * 100}%`,
                left: `${(-frame.x / frame.width) * 100}%`,
                top: `${(-frame.y / frame.height) * 100}%`,
              }}
            />
          </div>
        )}
      </div>
      <span className="image-preview-caption">FINAL PREVIEW · AUTOMATICALLY SIZED</span>
    </div>
  );
  return (
    <div className="admin-overlay image-resize-overlay">
      <section
        className="admin-modal image-resize-editor"
        role="dialog"
        aria-modal="true"
        aria-label="Crop and resize product image"
      >
        <div className="admin-modal-heading">
          <div>
            <span className="eyebrow">THE PERFECT LITTLE FIT</span>
            <h2>A little crop. The perfect fit.</h2>
          </div>
          <button aria-label="Close image resize" disabled={busy} onClick={onClose}>
            <X />
          </button>
        </div>
        <form onSubmit={apply}>
          <div className="image-resize-body">
            <div className="image-editor-visuals">
              <div className="image-edit-mode" aria-label="Image editing mode">
                <button
                  type="button"
                  className={cropEnabled ? 'selected' : ''}
                  disabled={busy}
                  onClick={() => setCropEnabled(true)}
                >
                  <Crop size={15} />
                  Crop image
                </button>
                <button
                  type="button"
                  className={!cropEnabled ? 'selected' : ''}
                  disabled={busy}
                  onClick={() => setCropEnabled(false)}
                >
                  <ImagePlus size={15} />
                  Fit whole image
                </button>
              </div>
              {cropEnabled && natural.width > 0 && (
                <CropSelector
                  source={source}
                  sourceWidth={natural.width}
                  sourceHeight={natural.height}
                  crop={crop}
                  aspect={aspect}
                  disabled={busy}
                  onChange={setCrop}
                />
              )}
              {!cropEnabled && finalPreview}
            </div>
            <div className="image-resize-controls">
              <label>
                Image shape
                <select
                  value={shape}
                  disabled={busy}
                  onChange={(e) => chooseShape(e.target.value as Shape)}
                >
                  <option value="square">Square</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                  <option value="original">Original proportions</option>
                  <option value="free">Free crop</option>
                </select>
              </label>
              <p className="image-auto-size-note">
                Just crop the image the way you like. We’ll adjust the upload size automatically.
              </p>
              {cropEnabled && (
                <>
                  <label>
                    {shape === 'free' ? 'Crop width' : 'Crop size'}
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="1"
                      aria-label="Crop size"
                      disabled={busy || !natural.width}
                      value={Math.round(
                        (crop.width /
                          centeredCrop(natural.width || 1, natural.height || 1, aspect).width) *
                          100,
                      )}
                      onChange={(e) => {
                        const maximum = centeredCrop(natural.width, natural.height, aspect);
                        const factor = Number(e.target.value) / 100;
                        const width = maximum.width * factor;
                        const height = shape === 'free' ? crop.height : maximum.height * factor;
                        setCrop({
                          width,
                          height,
                          x: Math.max(0, Math.min(100 - width, crop.x + (crop.width - width) / 2)),
                          y: Math.max(
                            0,
                            Math.min(100 - height, crop.y + (crop.height - height) / 2),
                          ),
                        });
                      }}
                    />
                  </label>
                  {shape === 'free' && (
                    <label>
                      Crop height
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="1"
                        aria-label="Crop height"
                        disabled={busy}
                        value={crop.height}
                        onChange={(e) => {
                          const height = Number(e.target.value);
                          setCrop({
                            ...crop,
                            height,
                            y: Math.max(
                              0,
                              Math.min(100 - height, crop.y + (crop.height - height) / 2),
                            ),
                          });
                        }}
                      />
                    </label>
                  )}
                </>
              )}
              <label>
                Image size <span className="image-scale-value">{scale}%</span>
                <input
                  aria-label="Image size percentage"
                  type="range"
                  min="25"
                  max="100"
                  step="1"
                  disabled={busy}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                />
              </label>
              <button
                className="text-link"
                type="button"
                disabled={busy}
                onClick={() => {
                  chooseShape('square');
                  setScale(100);
                }}
              >
                <RotateCcw size={14} />
                Reset crop & spacing
              </button>
              {cropEnabled && finalPreview}
              <p className="image-crop-help">Empty or transparent areas are filled with white.</p>
            </div>
          </div>
          {error && (
            <div className="admin-alert error image-resize-error" role="alert">
              {error}
            </div>
          )}
          <div className="admin-modal-footer">
            <button type="button" className="admin-secondary" disabled={busy} onClick={onClose}>
              Cancel
            </button>
            <button className="primary" disabled={busy || !natural.width}>
              {busy ? 'Uploading…' : 'Apply & upload'}
              <Check size={17} />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
