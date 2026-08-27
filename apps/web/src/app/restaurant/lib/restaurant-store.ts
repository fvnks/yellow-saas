'use client';

export interface MenuItem {
  id: string;
  name: string;
  category: 'food' | 'drink' | 'dessert';
  priceCLP: number;
  description: string;
  station: 'kitchen' | 'bar';
  inStock: boolean;
  image: string;
  suggestion?: string;
}

export interface TableSession {
  tableId: number;
  tableName: string;
  capacity: number;
  status: 'free' | 'occupied' | 'reserved' | 'bill_requested';
  pinCode: string;
  currentOrder?: Order;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  priceCLP: number;
  quantity: number;
  station: 'kitchen' | 'bar';
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
}

export interface Order {
  id: string;
  tableId: number;
  tableName: string;
  pinCode: string;
  items: OrderItem[];
  totalCLP: number;
  createdAt: string;
  status: 'active' | 'closed';
  waiterName?: string;
  dteStatus?: 'boleta_emitida' | 'pendiente';
}

export interface Reservation {
  id: string;
  reservationCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tableId: number;
  tableName: string;
  date: string;
  time: string;
  peopleCount: number;
  status: 'confirmed' | 'cancelled' | 'seated';
}

export const INITIAL_MENU_ITEMS: MenuItem[] = [];

export const INITIAL_TABLES: TableSession[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_RESERVATIONS: Reservation[] = [];
