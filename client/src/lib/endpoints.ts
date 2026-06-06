const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const API = {
  BASE,

  // Auth
  auth: {
    register:      `${BASE}/api/auth/register`,
    login:         `${BASE}/api/auth/login`,
    logout:        `${BASE}/api/auth/logout`,
    check:         `${BASE}/api/auth/check`,
    forgotPassword:`${BASE}/api/auth/forgot-password`,
    resetPassword: `${BASE}/api/auth/reset-password`,
  },

  // Admin
  admin: {
    dashboard: `${BASE}/api/admin/dashboard`,
    help: `${BASE}/api/admin/help`,
    products: {
      list:   `${BASE}/api/admin/products`,
      create: `${BASE}/api/admin/products`,
      update: (id: string) => `${BASE}/api/admin/products/${id}`,
      delete: (id: string) => `${BASE}/api/admin/products/${id}`,
      toggle: (id: string) => `${BASE}/api/admin/products/${id}/toggle`,
    },
    orders: {
      list:         `${BASE}/api/admin/orders`,
      detail:       (id: string) => `${BASE}/api/admin/orders/${id}`,
      updateStatus: (id: string) => `${BASE}/api/admin/orders/${id}/status`,
    },
  },

  // Shop
  shop: {
    products: {
      list:   `${BASE}/api/shop/products`,
      detail: (id: string) => `${BASE}/api/shop/products/${id}`,
    },
    cart: {
      get:    `${BASE}/api/shop/cart`,
      add:    `${BASE}/api/shop/cart`,
      update: `${BASE}/api/shop/cart`,
      remove: (productId: string) => `${BASE}/api/shop/cart/${productId}`,
      clear:  `${BASE}/api/shop/cart/clear`,
    },
    address: {
      list:   `${BASE}/api/shop/address`,
      create: `${BASE}/api/shop/address`,
      update: (id: string) => `${BASE}/api/shop/address/${id}`,
      delete: (id: string) => `${BASE}/api/shop/address/${id}`,
    },
    orders: {
      razorpay: `${BASE}/api/shop/order/razorpay-order`,
      create:   `${BASE}/api/shop/order`,
      list:     `${BASE}/api/shop/order`,
      detail:   (id: string) => `${BASE}/api/shop/order/${id}`,
      cancel:   (id: string) => `${BASE}/api/shop/order/${id}/cancel`,
      return:   (id: string) => `${BASE}/api/shop/order/${id}/return`,
    },
    reviews: {
      list: (productId: string) => `${BASE}/api/shop/review/${productId}`,
      add:  `${BASE}/api/shop/review`,
    },
    wishlist: {
      get:    `${BASE}/api/shop/wishlist`,
      toggle: `${BASE}/api/shop/wishlist/toggle`,
    },
    search: `${BASE}/api/shop/search`,
  },

  // Common
  common: {
    features: `${BASE}/api/common/feature`,
    settings: `${BASE}/api/common/settings`,
    helpPages: `${BASE}/api/common/help`,
    upload: {
      single:   `${BASE}/api/upload/media`,
      multiple: `${BASE}/api/upload/media/multiple`,
      delete:   `${BASE}/api/upload/media`,
    },
  },
};
