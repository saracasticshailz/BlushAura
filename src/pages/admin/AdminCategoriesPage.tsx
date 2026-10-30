import { ArrowUpRight, FolderTree, Trash2 } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { type AdminModel } from '../../hooks/useAdmin';

type Props = Pick<
  AdminModel,
  | 'confirmDeleteCategory'
  | 'view'
  | 'products'
  | 'categories'
  | 'setCategory'
  | 'setCategoryOriginal'
  | 'setError'
>;
export function AdminCategoriesPage(props: Props) {
  const {
    confirmDeleteCategory,
    view,
    products,
    categories,
    setCategory,
    setCategoryOriginal,
    setError,
  } = props;
  return (
    <>
      {view === 'categories' && (
        <div className="admin-category-grid">
          {categories.map((c) => (
            <section className="admin-panel admin-category" key={c.name}>
              <div className="admin-category-icon">
                <FolderTree size={22} />
              </div>
              <h2>{c.name}</h2>
              <p>
                {products.filter((p) => p.category === c.name).length} products ·{' '}
                {c.subcategories.length} subcategories
              </p>
              <div className="admin-category-tags">
                {c.subcategories.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              <div className="admin-category-bottom">
                <Button
                  onClick={() => {
                    setError('');
                    setCategoryOriginal(c.name);
                    setCategory({ ...c, subcategories: [...c.subcategories] });
                  }}
                >
                  Edit category <ArrowUpRight size={14} />
                </Button>
                <Button
                  aria-label={`Delete category ${c.name}`}
                  onClick={() => confirmDeleteCategory(c.name)}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </section>
          ))}
          {!categories.length && (
            <div className="admin-empty">
              <FolderTree size={30} />
              <h2>Your categories start here.</h2>
              <p>Add a category before creating products.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
