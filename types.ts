export interface Product {
  id: string;
  name: string;
  brand: string;
  lotNumber: string;
  expiryDate: string;
  costPrice: number;
  salePrice: number;
  supplier: string;
  quantity: number;
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  date: string;
  createdAt?: string;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export interface BodyMarker {
  id: string;
  x: number;
  y: number;
  note: string;
  side: 'front' | 'back';
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  photoUrl?: string;
}

export interface AnamnesisField {
  id: string;
  label: string;
  type: 'text' | 'boolean' | 'select';
  options?: string[];
  value: string | boolean;
}

export interface FinancialRecord {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
}

export interface PatientPayment {
  id: string;
  date: string;
  procedure: string;
  amount: number;
  paymentMethod?: string;
  paymentMethod2?: string;
  amountMethod1?: number;
  amountMethod2?: number;
  discount?: number;
  observation?: string;
  receiptUrl?: string;
}

export interface Appointment {
  id: string;
  date: string;
  procedure: string;
  status: 'completed' | 'scheduled' | 'cancelled';
}


export type UserPermission = 'financial' | 'stock' | 'patients' | 'calendar' | 'skin-analysis' | 'settings';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'collaborator';
  permissions: UserPermission[];
  status: 'active' | 'pending' | 'blocked';
  created_at?: string;
}

export type ViewState = 'dashboard' | 'patients' | 'stock' | 'financial' | 'calendar' | 'skin-analysis' | 'admin-users';