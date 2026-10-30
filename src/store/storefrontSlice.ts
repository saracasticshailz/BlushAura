import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
export type Cart = Record<string, number>;
function readSaved(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}
const savedCart = readSaved('blushaura.cart');
const savedWishlist = readSaved('blushaura.wishlist');
const cart: Cart =
  savedCart && typeof savedCart === 'object' && !Array.isArray(savedCart)
    ? Object.fromEntries(
        Object.entries(savedCart).filter(
          ([, v]) => typeof v === 'number' && Number.isInteger(v) && v > 0 && v <= 99,
        ),
      )
    : {};
const wishlist: string[] = Array.isArray(savedWishlist)
  ? savedWishlist.filter((id): id is string => typeof id === 'string')
  : [];
const initialState = {
  cart,
  wishlist,
  page: 'home',
  category: 'All essentials',
  sub: 'All',
  search: '',
  searchOpen: false,
  sort: 'featured',
  selectedId: null as string | null,
  cartOpen: false,
  mobile: false,
  toast: '',
  step: 1,
  payment: 'card',
};
export const storefrontSlice = createSlice({
  name: 'storefront',
  initialState,
  reducers: {
    navigate(state, action: PayloadAction<{ page: string; category: string }>) {
      state.page = action.payload.page;
      state.category = action.payload.category;
      state.sub = 'All';
      state.selectedId = null;
      state.mobile = false;
      state.search = '';
    },
    categoryChanged(state, a: PayloadAction<string>) {
      state.category = a.payload;
    },
    subcategoryChanged(state, a: PayloadAction<string>) {
      state.sub = a.payload;
    },
    searchChanged(state, a: PayloadAction<string>) {
      state.search = a.payload;
    },
    sortChanged(state, a: PayloadAction<string>) {
      state.sort = a.payload;
    },
    searchToggled(state, a: PayloadAction<boolean>) {
      state.searchOpen = a.payload;
    },
    cartToggled(state, a: PayloadAction<boolean>) {
      state.cartOpen = a.payload;
    },
    mobileToggled(state, a: PayloadAction<boolean>) {
      state.mobile = a.payload;
    },
    productSelected(state, a: PayloadAction<string | null>) {
      state.selectedId = a.payload;
    },
    toastChanged(state, a: PayloadAction<string>) {
      state.toast = a.payload;
    },
    checkoutStepChanged(state, a: PayloadAction<number>) {
      state.step = a.payload;
    },
    paymentChanged(state, a: PayloadAction<string>) {
      state.payment = a.payload;
    },
    itemAdded(state, a: PayloadAction<string>) {
      state.cart[a.payload] = (state.cart[a.payload] || 0) + 1;
    },
    quantityChanged(state, a: PayloadAction<{ id: string; delta: number }>) {
      const next = (state.cart[a.payload.id] || 0) + a.payload.delta;
      if (next <= 0) delete state.cart[a.payload.id];
      else state.cart[a.payload.id] = Math.min(next, 99);
    },
    itemRemoved(state, a: PayloadAction<string>) {
      delete state.cart[a.payload];
    },
    cartCleared(state) {
      state.cart = {};
    },
    wishlistToggled(state, a: PayloadAction<string>) {
      const id = a.payload;
      state.wishlist = state.wishlist.includes(id)
        ? state.wishlist.filter((v) => v !== id)
        : [...state.wishlist, id];
    },
    unavailableItemsRemoved(state, a: PayloadAction<string[]>) {
      for (const id of Object.keys(state.cart)) if (!a.payload.includes(id)) delete state.cart[id];
    },
  },
});
export const storefrontActions = storefrontSlice.actions;
