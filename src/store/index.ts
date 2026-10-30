import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { storeApi } from '../services/storeApi';
import { adminSlice } from './adminSlice';
import { storefrontSlice } from './storefrontSlice';
export const store = configureStore({
  reducer: {
    storefront: storefrontSlice.reducer,
    admin: adminSlice.reducer,
    [storeApi.reducerPath]: storeApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(storeApi.middleware),
  devTools: import.meta.env.DEV,
});
setupListeners(store.dispatch);
let previousCart = store.getState().storefront.cart;
let previousWishlist = store.getState().storefront.wishlist;
store.subscribe(() => {
  const { cart, wishlist } = store.getState().storefront;
  try {
    if (cart !== previousCart) localStorage.setItem('blushaura.cart', JSON.stringify(cart));
    if (wishlist !== previousWishlist)
      localStorage.setItem('blushaura.wishlist', JSON.stringify(wishlist));
  } catch {
    /* The app remains usable when browser storage is unavailable. */
  }
  previousCart = cart;
  previousWishlist = wishlist;
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
