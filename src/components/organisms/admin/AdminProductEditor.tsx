import { Check, ImagePlus, X } from 'lucide-react';
import { type AdminModel } from '../../../hooks/useAdmin';
import { Button } from '../../atoms/Button';
import { ProductImage } from '../../atoms/ProductImage';

type Props = Pick<
  AdminModel,
  | 'imageFile'
  | 'categories'
  | 'product'
  | 'setProduct'
  | 'error'
  | 'busy'
  | 'uploading'
  | 'saveProduct'
  | 'chooseImage'
  | 'resizeExisting'
>;
export function AdminProductEditor(props: Props) {
  const {
    imageFile,
    categories,
    product,
    setProduct,
    error,
    busy,
    uploading,
    saveProduct,
    chooseImage,
    resizeExisting,
  } = props;
  return (
    <>
      {product && (
        <div className="admin-overlay">
          <section
            className="admin-modal product-editor"
            role="dialog"
            aria-modal="true"
            aria-label={product.id ? 'Edit product' : 'Add product'}
          >
            <div className="admin-modal-heading">
              <div>
                <span className="eyebrow">THE COLLECTION EDIT</span>
                <h2>{product.id ? 'A little product refresh.' : 'Something new to love.'}</h2>
              </div>
              <Button
                disabled={busy || uploading || !!imageFile}
                aria-label="Close product editor"
                onClick={() => setProduct(null)}
              >
                <X />
              </Button>
            </div>
            {error && (
              <div className="admin-alert error" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={saveProduct}>
              <div className="admin-product-form">
                <div>
                  <div className="admin-upload-preview">
                    <ProductImage product={product} />
                  </div>
                  <label className="admin-upload-button">
                    <ImagePlus size={17} />
                    {uploading ? 'Uploading…' : 'Upload product image'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      disabled={uploading || busy}
                      onChange={(e) => {
                        chooseImage(e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <small className="admin-help">
                    JPEG or PNG · Up to 5 MB. Crop and preview before uploading. Size adjusts
                    automatically.
                  </small>
                  {product.imageUrl && (
                    <Button
                      type="button"
                      variant="text"
                      disabled={busy || uploading || !!imageFile}
                      onClick={resizeExisting}
                    >
                      Crop / resize current image
                    </Button>
                  )}
                  {product.imageUrl && (
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => setProduct({ ...product, imageUrl: '' })}
                    >
                      Use illustration instead
                    </Button>
                  )}
                  <label>
                    Illustration style
                    <select
                      value={product.kind}
                      onChange={(e) => setProduct({ ...product, kind: e.target.value })}
                    >
                      {['wand', 'oil', 'pebble', 'bundle', 'candle'].map((k) => (
                        <option key={k}>{k}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Illustration colour
                    <input
                      type="color"
                      value={product.color}
                      onChange={(e) => setProduct({ ...product, color: e.target.value })}
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Product name
                    <input
                      required
                      maxLength={120}
                      value={product.name}
                      onChange={(e) => setProduct({ ...product, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Short description
                    <input
                      required
                      maxLength={250}
                      value={product.subtitle}
                      onChange={(e) => setProduct({ ...product, subtitle: e.target.value })}
                    />
                  </label>
                  <div className="admin-form-row">
                    <label>
                      Category
                      <select
                        required
                        value={product.category}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            category: e.target.value,
                            subcategory:
                              categories.find((c) => c.name === e.target.value)?.subcategories[0] ||
                              '',
                          })
                        }
                      >
                        <option value="">Choose category</option>
                        {categories.map((c) => (
                          <option key={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Subcategory
                      <select
                        required
                        value={product.subcategory}
                        onChange={(e) => setProduct({ ...product, subcategory: e.target.value })}
                      >
                        <option value="">Choose subcategory</option>
                        {categories
                          .find((c) => c.name === product.category)
                          ?.subcategories.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                      </select>
                    </label>
                  </div>
                  <div className="admin-form-row">
                    <label>
                      Price (INR)
                      <input
                        required
                        type="number"
                        min="0.01"
                        max="999999999"
                        step="0.01"
                        value={product.price}
                        onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                      />
                    </label>
                    <label>
                      Compare-at price (INR)
                      <input
                        required
                        type="number"
                        min={product.price}
                        max="999999999"
                        step="0.01"
                        value={product.original}
                        onChange={(e) =>
                          setProduct({ ...product, original: Number(e.target.value) })
                        }
                      />
                    </label>
                  </div>
                  <label>
                    Full description
                    <textarea
                      required
                      maxLength={10000}
                      rows={4}
                      value={product.description}
                      onChange={(e) => setProduct({ ...product, description: e.target.value })}
                    />
                  </label>
                  <div className="admin-form-row">
                    <label>
                      Stock available
                      <input
                        required
                        type="number"
                        min="0"
                        max="1000000"
                        value={product.stock}
                        onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })}
                      />
                    </label>
                    <label>
                      Display order
                      <input
                        required
                        type="number"
                        min="0"
                        max="100000"
                        value={product.displayOrder}
                        onChange={(e) =>
                          setProduct({ ...product, displayOrder: Number(e.target.value) })
                        }
                      />
                    </label>
                  </div>
                  <label>
                    Badge (optional)
                    <input
                      maxLength={80}
                      placeholder="e.g. NEW ARRIVAL"
                      value={product.badge || ''}
                      onChange={(e) => setProduct({ ...product, badge: e.target.value })}
                    />
                  </label>
                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={product.active}
                      onChange={(e) => setProduct({ ...product, active: e.target.checked })}
                    />
                    <span>
                      Publish in customer storefront
                      <small>Uncheck to keep this product as a draft.</small>
                    </span>
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <Button
                  type="button"
                  disabled={busy || uploading || !!imageFile}
                  className="admin-secondary"
                  onClick={() => setProduct(null)}
                >
                  Cancel
                </Button>
                <Button variant="primary" disabled={busy || uploading || !!imageFile}>
                  {busy ? 'Saving…' : 'Save product'}
                  <Check size={17} />
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
