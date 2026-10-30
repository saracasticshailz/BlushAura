import { CartDrawer } from '../components/organisms/storefront/CartDrawer';
import { ProductDetailDialog } from '../components/organisms/storefront/ProductDetailDialog';
import { ProductSearchDialog } from '../components/organisms/storefront/ProductSearchDialog';
import { StoreFooter } from '../components/organisms/storefront/StoreFooter';
import { StoreHeader } from '../components/organisms/storefront/StoreHeader';
import { StoreToast } from '../components/organisms/storefront/StoreToast';
import { StorefrontTemplate } from '../components/templates/StorefrontTemplate';
import { useStorefront } from '../hooks/useStorefront';
import { CheckoutPage } from './storefront/CheckoutPage';
import { CollectionPage } from './storefront/CollectionPage';
import { HomePage } from './storefront/HomePage';
import { OrderSuccessPage } from './storefront/OrderSuccessPage';
export function StorefrontPage() {
  const model = useStorefront();
  return (
    <StorefrontTemplate
      header={<StoreHeader {...model} />}
      footer={<StoreFooter {...model} />}
      overlays={
        <>
          <ProductDetailDialog {...model} />
          <CartDrawer {...model} />
          <ProductSearchDialog {...model} />
          <StoreToast {...model} />
        </>
      }
    >
      {model.apiState === 'offline' && (
        <div className="api-notice" role="status">
          The local backend is unavailable. Showing preview products; checkout requires the backend.
        </div>
      )}
      {model.page === 'home' ? (
        <HomePage {...model} />
      ) : model.page === 'shop' || model.page === 'wishlist' ? (
        <CollectionPage {...model} />
      ) : model.page === 'checkout' ? (
        <CheckoutPage {...model} />
      ) : (
        <OrderSuccessPage {...model} />
      )}
    </StorefrontTemplate>
  );
}
