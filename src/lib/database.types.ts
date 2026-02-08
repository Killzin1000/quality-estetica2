export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            patients: {
                Row: {
                    id: string
                    name: string
                    age: number | null
                    phone: string | null
                    photo_url: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    age?: number | null
                    phone?: string | null
                    photo_url?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    age?: number | null
                    phone?: string | null
                    photo_url?: string | null
                    created_at?: string | null
                }
            }
            patient_photos: {
                Row: {
                    id: string
                    patient_id: string | null
                    url: string
                    type: string
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    patient_id?: string | null
                    url: string
                    type: string
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    patient_id?: string | null
                    url?: string
                    type?: string
                    created_at?: string | null
                }
            }
            products: {
                Row: {
                    id: string
                    name: string
                    brand: string | null
                    lot_number: string | null
                    expiry_date: string | null
                    cost_price: number | null
                    sale_price: number | null
                    supplier: string | null
                    quantity: number | null
                }
                Insert: {
                    id?: string
                    name: string
                    brand?: string | null
                    lot_number?: string | null
                    expiry_date?: string | null
                    cost_price?: number | null
                    sale_price?: number | null
                    supplier?: string | null
                    quantity?: number | null
                }
                Update: {
                    id?: string
                    name?: string
                    brand?: string | null
                    lot_number?: string | null
                    expiry_date?: string | null
                    cost_price?: number | null
                    sale_price?: number | null
                    supplier?: string | null
                    quantity?: number | null
                }
            }
            appointments: {
                Row: {
                    id: string
                    patient_id: string | null
                    date: string
                    procedure: string | null
                    status: 'completed' | 'scheduled' | 'cancelled' | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    patient_id?: string | null
                    date: string
                    procedure?: string | null
                    status?: 'completed' | 'scheduled' | 'cancelled' | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    patient_id?: string | null
                    date?: string
                    procedure?: string | null
                    status?: 'completed' | 'scheduled' | 'cancelled' | null
                    created_at?: string | null
                }
            }
            financial_records: {
                Row: {
                    id: string
                    description: string
                    amount: number
                    type: 'income' | 'expense' | null
                    date: string
                    category: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    description: string
                    amount: number
                    type?: 'income' | 'expense' | null
                    date: string
                    category?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    description?: string
                    amount?: number
                    type?: 'income' | 'expense' | null
                    date?: string
                    category?: string | null
                    created_at?: string | null
                }
            }
            patient_payments: {
                Row: {
                    id: string
                    patient_id: string | null
                    date: string | null
                    procedure: string | null
                    amount: number | null
                    payment_method: string | null
                    payment_method_2: string | null
                    amount_method_1: number | null
                    amount_method_2: number | null
                    discount: number | null
                    observation: string | null
                    receipt_url: string | null
                }
                Insert: {
                    id?: string
                    patient_id?: string | null
                    date?: string | null
                    procedure?: string | null
                    amount?: number | null
                    payment_method?: string | null
                    payment_method_2?: string | null
                    amount_method_1?: number | null
                    amount_method_2?: number | null
                    discount?: number | null
                    observation?: string | null
                    receipt_url?: string | null
                }
                Update: {
                    id?: string
                    patient_id?: string | null
                    date?: string | null
                    procedure?: string | null
                    amount?: number | null
                    payment_method?: string | null
                    payment_method_2?: string | null
                    amount_method_1?: number | null
                    amount_method_2?: number | null
                    discount?: number | null
                    observation?: string | null
                    receipt_url?: string | null
                }
            }
            body_markers: {
                Row: {
                    id: string
                    patient_id: string | null
                    x: number
                    y: number
                    note: string | null
                    side: 'front' | 'back' | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    patient_id?: string | null
                    x: number
                    y: number
                    note?: string | null
                    side?: 'front' | 'back' | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    patient_id?: string | null
                    x?: number
                    y?: number
                    note?: string | null
                    side?: 'front' | 'back' | null
                    created_at?: string | null
                }
            }
            anamnesis_records: {
                Row: {
                    id: string
                    patient_id: string | null
                    data: Json
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    patient_id?: string | null
                    data: Json
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    patient_id?: string | null
                    data?: Json
                    created_at?: string | null
                }
            }
            clinical_notes: {
                Row: {
                    id: string
                    patient_id: string | null
                    content: string
                    date: string
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    patient_id?: string | null
                    content: string
                    date?: string
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    patient_id?: string | null
                    content?: string
                    date?: string
                    created_at?: string | null
                }
            }
        }
    }
}
