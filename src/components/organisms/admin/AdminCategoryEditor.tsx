import { Check, Plus, X } from 'lucide-react';
import { type AdminModel } from '../../../hooks/useAdmin';
import { Button } from '../../atoms/Button';

type Props = Pick<
  AdminModel,
  'category' | 'setCategory' | 'categoryOriginal' | 'error' | 'busy' | 'saveCategory'
>;
export function AdminCategoryEditor(props: Props) {
  const { category, setCategory, categoryOriginal, error, busy, saveCategory } = props;
  return (
    <>
      {category && (
        <div className="admin-overlay">
          <section
            className="admin-modal category-editor"
            role="dialog"
            aria-modal="true"
            aria-label="Category editor"
          >
            <div className="admin-modal-heading">
              <div>
                <span className="eyebrow">A THOUGHTFUL STRUCTURE</span>
                <h2>{categoryOriginal ? 'Edit category' : 'New category'}</h2>
              </div>
              <Button
                disabled={busy}
                aria-label="Close category editor"
                onClick={() => setCategory(null)}
              >
                <X />
              </Button>
            </div>
            {error && (
              <div className="admin-alert error" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={saveCategory}>
              <div className="admin-form-body">
                <label>
                  Category name
                  <input
                    required
                    maxLength={120}
                    value={category.name}
                    onChange={(e) => setCategory({ ...category, name: e.target.value })}
                  />
                </label>
                <label>Subcategories</label>
                {category.subcategories.map((s, i) => (
                  <div className="admin-subcategory-input" key={i}>
                    <input
                      required
                      maxLength={120}
                      aria-label={`Subcategory ${i + 1}`}
                      value={s}
                      onChange={(e) =>
                        setCategory({
                          ...category,
                          subcategories: category.subcategories.map((v, j) =>
                            i === j ? e.target.value : v,
                          ),
                        })
                      }
                    />
                    <Button
                      type="button"
                      aria-label={`Remove subcategory ${i + 1}`}
                      disabled={category.subcategories.length <= 1}
                      onClick={() =>
                        setCategory({
                          ...category,
                          subcategories: category.subcategories.filter((_, j) => i !== j),
                        })
                      }
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="text"
                  onClick={() =>
                    setCategory({ ...category, subcategories: [...category.subcategories, ''] })
                  }
                >
                  <Plus size={15} />
                  Add subcategory
                </Button>
                <p className="admin-help">
                  Renaming a category updates its products automatically. A subcategory in use
                  cannot be removed; move its products first.
                </p>
              </div>
              <div className="admin-modal-footer">
                <Button
                  type="button"
                  className="admin-secondary"
                  disabled={busy}
                  onClick={() => setCategory(null)}
                >
                  Cancel
                </Button>
                <Button variant="primary" disabled={busy}>
                  {busy ? 'Saving…' : 'Save category'}
                  <Check size={16} />
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
