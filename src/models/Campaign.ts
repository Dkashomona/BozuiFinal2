export interface Campaign {
  scope: string;
  type: string;
  id: string;

  title: string;
  subtitle?: string;

  bannerImage: string;        // banner path in Storage

  productIds: string[];       // list of product references

  startDate: any;             // Firebase Timestamp
  endDate: any;

  priority: number;           // 1 = highest
  isActive: boolean;

  createdAt: any;
  updatedAt: any;
}
