import { ArrowDown, ArrowUp, Film, ImagePlus, Trash2 } from 'lucide-react';
import { type AdminModel } from '../../../hooks/useAdmin';
import { Button } from '../../atoms/Button';

type Props = Pick<
  AdminModel,
  'product' | 'setProduct' | 'busy' | 'uploading' | 'imageFile' | 'chooseGalleryMedia'
>;
export function AdminGalleryEditor({
  product,
  setProduct,
  busy,
  uploading,
  imageFile,
  chooseGalleryMedia,
}: Props) {
  if (!product) return null;
  const media = product.media ?? [];
  const disabled = busy || uploading || !!imageFile;
  function move(index: number, delta: number) {
    const next = [...media];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    setProduct({ ...product!, media: next });
  }
  return (
    <section className="admin-gallery" aria-label="Product media gallery">
      <h3>Images & reels</h3>
      <p className="admin-help">
        Add up to 8 images or videos. Drag-free ordering with the arrows below. Use a 9:16 video for
        a full-height reel; other shapes fit without cropping.
      </p>
      <label className="admin-upload-button">
        <ImagePlus size={18} />
        {uploading ? 'Uploading…' : 'Add image or video'}
        <input
          type="file"
          accept="image/jpeg,image/png,video/mp4,video/webm"
          disabled={disabled || media.length >= 8}
          onChange={(event) => {
            void chooseGalleryMedia(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </label>
      <small className="admin-help">
        JPEG / PNG · 5 MB. MP4 / WebM · 20 MB. Images open the crop editor; videos keep their
        original framing. Use H.264 MP4 for broad browser support. Save the product to publish.
      </small>
      {media.map((item, index) => (
        <div className="admin-gallery-item" key={item.url}>
          <div className="admin-gallery-thumb">
            {item.type === 'image' ? <img src={item.url} alt="" /> : <Film size={26} />}
          </div>
          <label>
            {item.type === 'video' ? 'Video' : 'Image'} {index + 1} caption
            <input
              maxLength={160}
              value={item.caption}
              disabled={disabled}
              onChange={(event) =>
                setProduct({
                  ...product,
                  media: media.map((value, i) =>
                    i === index ? { ...value, caption: event.target.value } : value,
                  ),
                })
              }
            />
          </label>
          <div className="admin-gallery-actions">
            <Button
              type="button"
              aria-label={`Move media ${index + 1} earlier`}
              disabled={disabled || index === 0}
              onClick={() => move(index, -1)}
            >
              <ArrowUp size={16} />
            </Button>
            <Button
              type="button"
              aria-label={`Move media ${index + 1} later`}
              disabled={disabled || index === media.length - 1}
              onClick={() => move(index, 1)}
            >
              <ArrowDown size={16} />
            </Button>
            <Button
              type="button"
              aria-label={`Remove media ${index + 1}`}
              disabled={disabled}
              onClick={() => setProduct({ ...product, media: media.filter((_, i) => i !== index) })}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      ))}
    </section>
  );
}
