export type ProductStatus = 'draft' | 'active' | 'archived';
export type StockLevel = 'in_stock' | 'low_stock' | 'out_of_stock';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'archived';
export type CategoryStatus = 'active' | 'archived';

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

export interface DashboardSnapshot {
  readonly totalProducts: number;
  readonly activeProducts: number;
  readonly draftProducts: number;
  readonly categoryCount: number;
  readonly pendingReviewCount: number;
  readonly recentProducts: readonly Product[];
  readonly pendingReviews: readonly Review[];
}
