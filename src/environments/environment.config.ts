export const apiEndpoints = {
  authLogin: '/auth/login',
  dashboardSummary: '/admin/dashboard/summary',
  orders: '/admin/orders',
  orderDetail: '/admin/orders/:id',
  orderFulfillment: '/admin/orders/:id/fulfillment',
  orderDelivery: '/admin/orders/:id/delivery',
  customers: '/admin/customers',
  customerDetail: '/admin/customers/:id',
  products: '/admin/products',
  productDetail: '/admin/products/:id',
  productRestore: '/admin/products/:id/restore',
  categories: '/admin/categories',
  categoryDetail: '/admin/categories/:id',
  categoryOrder: '/admin/categories/order',
  categoryRestore: '/admin/categories/:id/restore',
  reviews: '/admin/reviews',
  reviewDetail: '/admin/reviews/:id',
  reviewStatus: '/admin/reviews/:id/status',
  uploadSignature: '/admin/uploads/signature',
  uploads: '/admin/uploads',
} as const;

export const externalEndpoints = {
  cloudinaryImageUpload: 'https://api.cloudinary.com/v1_1/:cloudName/image/upload',
} as const;

export const storefrontRoutes = {
  productDetail: '/product/:slug',
} as const;
