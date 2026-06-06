export interface User {
  id: string;
  email: string;
  role: "user" | "admin";
  userName: string;
}

export interface Media {
  url: string;
  type: "image" | "video";
  isPrimary: boolean;
  _id?: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  media: Media[];
  primaryImage: string;
  category: string;
  subCategory: string;
  brand: string;
  sku: string;
  price: number;
  salePrice: number;
  totalStock: number;
  averageReview: number;
  totalReviews: number;
  tags: string[];
  specifications: { key: string; value: string }[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: Product;
  quantity: number;
  _id?: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
}

export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentMethod = "cod" | "upi" | "card" | "netbanking" | "wallet";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  userId: { _id: string; userName: string; email: string } | string;
  items: OrderItem[];
  addressInfo: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  totalAmount: number;
  couponCode: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  trackingId: string;
  orderDate: string;
  createdAt: string;
  returnRequested: boolean;
  returnReason: string;
  statusHistory: { status: string; timestamp: string; note: string }[];
}

export interface Review {
  _id: string;
  userId: { userName: string } | string;
  userName: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Feature {
  _id: string;
  image: string;
  title?: string;
}

export interface Settings {
  logo?: string;
  appName?: string;
  email?: string;
  phone?: string;
  freeDeliveryThreshold?: number;
  deliveryCharge?: number;
  footer?: {
    about?: string;
    helpLinks?: { label: string; url: string }[];
    socialLinks?: Record<string, string>;
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;
    bottomText?: string;
  };
}

export interface DashboardData {
  overview: {
    totalOrders: number;
    monthOrders: number;
    orderGrowth: string;
    totalRevenue: number;
    monthRevenue: number;
    totalUsers: number;
    monthUsers: number;
    totalProducts: number;
    lowStockProducts: number;
  };
  recentOrders: Order[];
  orderStatusCounts: { _id: string; count: number }[];
  monthlyRevenue: { _id: { year: number; month: number }; revenue: number; orders: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
  page?: number;
  totalPages?: number;
}
