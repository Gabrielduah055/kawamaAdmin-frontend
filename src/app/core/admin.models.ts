export type ProductStatus = 'draft' | 'active' | 'archived';
export type StockLevel = 'in_stock' | 'low_stock' | 'out_of_stock';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'archived';
export type CategoryStatus = 'active' | 'archived';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'needs_attention';
export type FulfillmentStatus =
  | 'awaiting_payment'
  | 'paid_awaiting_delivery'
  | 'processing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'needs_attention';
export type FulfillmentUpdateStatus = Extract<FulfillmentStatus, 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled'>;
export type DeliveryFeeStatus = 'not_quoted' | 'quoted' | 'collected' | 'waived';
export type StockReservationStatus = 'active' | 'committed' | 'released';
export type CustomerStatus = 'active' | 'blocked';

export interface ApiEnvelope<T> {
  readonly message?: string;
  readonly data: T;
}

export interface PageMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
}

export interface PaginatedEnvelope<T> extends ApiEnvelope<readonly T[]> {
  readonly meta: PageMeta;
}

export interface AdminUser {
  readonly id: string;
  readonly email: string;
  readonly role: 'owner';
}

export interface AuthSession {
  readonly token: string;
  readonly tokenType: 'Bearer';
  readonly expiresAt: number;
  readonly admin: AdminUser;
}

export interface LoginResponse {
  readonly token: string;
  readonly tokenType: 'Bearer';
  readonly expiresIn: number;
  readonly admin: AdminUser;
}

export interface ProductImage {
  readonly src: string;
  readonly alt: string;
  readonly publicId?: string;
  readonly position: number;
}

export interface ProductSpecification {
  readonly label: string;
  readonly value: string;
}

export interface Category {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly image?: Omit<ProductImage, 'position'>;
  readonly displayOrder: number;
  readonly status: CategoryStatus;
  readonly updatedBy?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface CategoryInput {
  readonly name: string;
  readonly slug?: string;
  readonly description: string;
  readonly image?: Omit<ProductImage, 'position'>;
  readonly displayOrder: number;
  readonly status?: CategoryStatus;
}

export interface Product {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly category: string;
  readonly categorySlug?: string;
  readonly categoryId: string;
  readonly shortDescription: string;
  readonly description: string;
  readonly price: number;
  readonly compareAtPrice?: number;
  readonly currency: 'GHS';
  readonly images: readonly ProductImage[];
  readonly inStock: boolean;
  readonly stockLevel: StockLevel;
  readonly stockQuantity: number;
  readonly lowStockThreshold: number;
  readonly featured: boolean;
  readonly isNew: boolean;
  readonly isBestSeller: boolean;
  readonly complementaryCategories: readonly string[];
  readonly complementaryCategoryIds: readonly string[];
  readonly details: readonly string[];
  readonly specifications: readonly ProductSpecification[];
  readonly status: ProductStatus;
  readonly updatedBy?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface ProductInput {
  readonly slug?: string;
  readonly name: string;
  readonly categoryId: string;
  readonly shortDescription: string;
  readonly description: string;
  readonly price: number;
  readonly compareAtPrice?: number;
  readonly images: readonly ProductImage[];
  readonly stockQuantity: number;
  readonly lowStockThreshold: number;
  readonly featured: boolean;
  readonly isNew: boolean;
  readonly isBestSeller: boolean;
  readonly complementaryCategoryIds: readonly string[];
  readonly details: readonly string[];
  readonly specifications: readonly ProductSpecification[];
  readonly status: Exclude<ProductStatus, 'archived'>;
}

export interface ReviewProduct {
  readonly _id?: string;
  readonly id?: string;
  readonly name: string;
  readonly slug: string;
}

export interface Review {
  readonly id: string;
  readonly product: ReviewProduct | string;
  readonly reviewerName: string;
  readonly rating: number;
  readonly comment: string;
  readonly status: ReviewStatus;
  readonly createdAt: string;
  readonly moderatedAt?: string;
  readonly moderatedBy?: string;
}

export interface UploadSignature {
  readonly timestamp: number;
  readonly signature: string;
  readonly cloudName: string;
  readonly apiKey: string;
  readonly folder: string;
}

export interface AdminOrderCustomer {
  readonly fullName: string;
  readonly email: string;
  readonly whatsappNumber: string;
}

export interface AdminOrderSummary {
  readonly id: string;
  readonly orderNumber: string;
  readonly customer: AdminOrderCustomer;
  readonly itemCount: number;
  readonly unitCount: number;
  readonly currency: 'GHS';
  readonly subtotalPesewas: number;
  readonly productPaymentTotalPesewas: number;
  readonly deliveryFeePesewas: number | null;
  readonly grandTotalPesewas: number;
  readonly deliveryPaymentMethod: 'pay_on_delivery';
  readonly deliveryFeeStatus: DeliveryFeeStatus;
  readonly paymentProvider: 'paystack';
  readonly paymentReference: string;
  readonly paymentStatus: PaymentStatus;
  readonly fulfillmentStatus: FulfillmentStatus;
  readonly stockReservationStatus: StockReservationStatus;
  readonly stockReservationExpiresAt?: string;
  readonly paidAt?: string;
  readonly deliveredAt?: string;
  readonly cancelledAt?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface AdminOrderItem {
  readonly productId: string;
  readonly slug: string;
  readonly name: string;
  readonly image?: Pick<ProductImage, 'src' | 'alt'>;
  readonly unitPricePesewas: number;
  readonly quantity: number;
  readonly lineTotalPesewas: number;
}

export interface AdminPaymentAttempt {
  readonly id: string;
  readonly provider: 'paystack';
  readonly reference: string;
  readonly amountPesewas: number;
  readonly currency: 'GHS';
  readonly status: 'initializing' | 'uncertain' | 'reconciling' | 'initialized' | 'success' | 'failed' | 'needs_attention';
  readonly providerTransactionId?: string;
  readonly providerStatus?: string;
  readonly lastErrorCode?: string;
  readonly initializedAt?: string;
  readonly verifiedAt?: string;
  readonly paidAt?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface AdminOrderDetail extends Omit<AdminOrderSummary, 'customer'> {
  readonly customerRecordId: string | null;
  readonly customer: AdminOrderCustomer & {
    readonly deliveryAddress: string;
    readonly whatsappConsent: boolean;
  };
  readonly orderNotes: string;
  readonly items: readonly AdminOrderItem[];
  readonly paystackTransactionId?: string;
  readonly receipt?: {
    readonly number?: string;
    readonly url?: string;
    readonly generatedAt?: string;
  };
  readonly paymentVerifiedAt?: string;
  readonly inventoryCommittedAt?: string;
  readonly paymentAttempts: readonly AdminPaymentAttempt[];
}

export interface AdminCustomer {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly whatsappNumber: string;
  readonly whatsappConsentAt?: string;
  readonly defaultDeliveryAddress: string;
  readonly paidOrderCount: number;
  readonly lifetimeValuePesewas: number;
  readonly lastPaidOrderAt?: string;
  readonly status: CustomerStatus;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface AdminCustomerDetail extends AdminCustomer {
  readonly orderCount: number;
  readonly recentOrders: readonly AdminOrderSummary[];
}

export interface CommerceDashboardSummary {
  readonly orders: {
    readonly total: number;
    readonly pendingPayment: number;
    readonly paid: number;
    readonly refunded: number;
    readonly needsAttention: number;
    readonly awaitingDelivery: number;
    readonly delivered: number;
    readonly cancelled: number;
  };
  readonly revenue: {
    readonly currency: 'GHS';
    readonly grossProductRevenuePesewas: number;
    readonly collectedDeliveryFeesPesewas: number;
  };
  readonly customers: {
    readonly total: number;
    readonly active: number;
    readonly repeat: number;
  };
  readonly inventory: {
    readonly activeProducts: number;
    readonly reservedUnits: number;
    readonly lowStockProducts: number;
    readonly outOfStockProducts: number;
  };
  readonly recentOrders: readonly AdminOrderSummary[];
}

export interface DashboardSnapshot extends CommerceDashboardSummary {
  readonly catalog: {
    readonly totalProducts: number;
    readonly draftProducts: number;
  };
}
