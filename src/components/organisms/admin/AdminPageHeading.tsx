import { Plus } from 'lucide-react';
import { brand } from '../../../config';
import { blank } from '../../../data/admin';
import { type AdminModel } from '../../../hooks/useAdmin';
import { Button } from '../../atoms/Button';

type Props = Pick<
  AdminModel,
  'view' | 'categories' | 'setProduct' | 'setCategory' | 'setCategoryOriginal' | 'setError'
>;
export function AdminPageHeading(props: Props) {
  const { view, categories, setProduct, setCategory, setCategoryOriginal, setError } = props;
  return (
    <div className="admin-page-heading">
      <div>
        <span className="eyebrow">A LITTLE CARE GOES A LONG WAY</span>
        <h1>
          {view === 'overview'
            ? 'Your store, at a glance.'
            : view === 'products'
              ? 'The feel-good collection.'
              : view === 'categories'
                ? 'A place for everything.'
                : 'Every little order.'}
        </h1>
        <p>
          {view === 'overview'
            ? `Here’s what’s happening at ${brand.name} today.`
            : view === 'products'
              ? 'Curate the essentials your customers will fall in love with.'
              : view === 'categories'
                ? 'Give your collection a thoughtful structure.'
                : 'Real local records. Mock payments. Thoughtful service.'}
        </p>
      </div>
      {view === 'products' && (
        <Button
          variant="primary"
          onClick={() => {
            setError('');
            setProduct({
              ...blank,
              category: categories[0]?.name || '',
              subcategory: categories[0]?.subcategories[0] || '',
            });
          }}
        >
          <Plus size={16} />
          Add product
        </Button>
      )}
      {view === 'categories' && (
        <Button
          variant="primary"
          onClick={() => {
            setError('');
            setCategoryOriginal('');
            setCategory({ name: '', subcategories: [''] });
          }}
        >
          <Plus size={16} />
          Add category
        </Button>
      )}
    </div>
  );
}
