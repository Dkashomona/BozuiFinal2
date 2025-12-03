export interface Category {
  id: string;        // Firestore doc ID
  name: string;      // Category name chosen by admin
  icon?: string;     // Optional image URL
  createdAt: any;    // Firebase timestamp
}
