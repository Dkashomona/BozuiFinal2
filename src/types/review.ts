export type Review = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: any;
  verified?: boolean;
  images?: string[];
  likes?: number;
  likedBy?: string[];
  sellerReply?: {
    text: string;
    createdAt?: any;
  } | null;
};
