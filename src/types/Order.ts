// -----------------------------------------------
// 🔥 ORDER STATUS TYPES
// -----------------------------------------------
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered";

// -----------------------------------------------
// 🔥 ORDER ITEM TYPE
// -----------------------------------------------
export interface OrderItem {
  id: string;       // product ID
  name: string;
  price: number;    // in cents
  qty: number;
  image?: string;
  size?: string;
  color?: string;
}

// -----------------------------------------------
// 🔥 USER ADDRESS TYPE
// -----------------------------------------------
export interface OrderAddress {
  fullname: string;
  phone: string;
  city: string;
  country: string;
  street: string;
}

// -----------------------------------------------
// 🔥 FULL ORDER TYPE (FIRESTORE DOCUMENT)
// -----------------------------------------------
export interface Order {
  orderId: string;                // Public order number shown to users
  amount: number;                 // in cents
  items: OrderItem[];
  address: OrderAddress;

  status: OrderStatus;
  createdAt: any;                 // Firestore Timestamp
  updatedAt?: any;

  userId: string;                 // Owner of the order
  email?: string;
  pushToken?: string;
}
