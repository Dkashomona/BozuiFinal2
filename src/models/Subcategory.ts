export interface Subcategory {
  id: string;              // Firestore document ID
  categoryId: string;      // Parent category reference
  name: string;            // Subcategory name
  createdAt: any;          // Firebase Timestamp
}
