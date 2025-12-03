export interface UserAddress {
  label: string;
  street: string;
  city: string;
  country: string;
}

export interface User {
  id: string;                 // Firebase Auth UID
  name: string;
  email: string;
  phone?: string;

  avatar?: string;            // profile picture path

  addresses: UserAddress[];

  wishlist: string[];         // list of product IDs

  createdAt: any;
}
