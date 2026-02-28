export type UserRole = 'manager' | 'administrator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Contact {
  id: string;
  fullName: string;
  email: string;
  company: string;
  phone?: string;
  billingAddress?: string;
  shippingAddress?: string;
  website?: string;
}

export interface Item {
  id: string;
  productCode: string;
  productName: string;
  specialInstructions?: string;
  status: 'in-progress' | 'completed';
  date: string;
  quantity: number;
  price?: number;
}

export type OrderStatus = 'draft' | 'confirmed' | 'closed' | 'void' | 'on-hold';

export interface Order {
  id: string;
  date: string;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  invoiced: boolean;
  packed: boolean;
  shipped: boolean;
  amount: number;
}

export type PackageStatus = 'not-shipped' | 'shipped' | 'delivered';

export interface Package {
  id: string;
  date: string;
  name: string;
  status: PackageStatus;
  trackingNumber?: string;
}

export type InvoiceStatus = 'sent' | 'paid' | 'overdue' | 'refunded';

export interface Invoice {
  id: string;
  name: string;
  date: string;
  amount: number;
  paid: number;
  status: InvoiceStatus;
  dueDate?: string;
}

export interface Integration {
  id: string;
  name: string;
  type: 'payment' | 'shipping' | 'ecommerce' | 'other';
  status: 'active' | 'inactive';
  icon?: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  ordersShipped: number;
  pendingOrders: number;
}

export interface CompanyProfile {
  id: string;
  name: string;
  numberOfUsers: number;
  billingAddress: string;
  shippingAddress: string;
  logo?: string;
}

export interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  address: string;
  class_name: string;
  status: string;
  enrollment_date: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  parent_relationship: string;
  current_class?: { id: string; name: string };
  academic_year?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  profile_photo?: string;
}

export interface Teacher {
  id: string;
  teacher_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address?: string;
  profile_photo?: string;
  join_date: string;
  qualification: string;
  specialization?: string;
  experience_years: number;
  status: string;
  department?: string;
  contract_type: string;
  salary?: number;
}
