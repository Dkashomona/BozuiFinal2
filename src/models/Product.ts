export interface Product {
  id: string;

  name: string;
  description: string;

  price: number;
  salePrice?: number;
  currency: string;

  // Up to 5 image URLs stored in Firebase Storage
  images: string[];

  // Optional 1 looping video
  video?: string;

  // Color → specific main image
  colorImages?: {
    [color: string]: string;
  };

  variants?: {
    sizes?: string[];
    colors?: string[];
  };

  // Stock per combination (e.g. "red_M": 10)
  variantStock?: {
    [variantKey: string]: number;
  };

  // Category relations
  categoryId: string;
  subcategoryId: string;

  stock: number;

  rating?: number;
  reviewsCount?: number;

  isFeatured?: boolean;
  isOnSale?: boolean;

  views: number;

  createdAt: any;
  updatedAt: any;
}
