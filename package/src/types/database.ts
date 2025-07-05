export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string
          date_of_birth: string
          fiscal_code: string | null
          address: string
          city: string
          postal_code: string
          province: string
          medical_history: string
          allergies: string | null
          medications: string | null
          is_smoker: boolean
          anamnesis: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string | null
          phone: string
          date_of_birth: string
          fiscal_code?: string | null
          address: string
          city: string
          postal_code: string
          province: string
          medical_history: string
          allergies?: string | null
          medications?: string | null
          is_smoker?: boolean
          anamnesis: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string
          date_of_birth?: string
          fiscal_code?: string | null
          address?: string
          city?: string
          postal_code?: string
          province?: string
          medical_history?: string
          allergies?: string | null
          medications?: string | null
          is_smoker?: boolean
          anamnesis?: string
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: number
          patient_id: string
          doctor_id: number
          treatment_id: number
          date: string
          start_time: string
          end_time: string
          status: 'confermato' | 'in attesa' | 'cancellato' | 'completato'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          patient_id: string
          doctor_id: number
          treatment_id: number
          date: string
          start_time: string
          end_time: string
          status?: 'confermato' | 'in attesa' | 'cancellato' | 'completato'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          patient_id?: string
          doctor_id?: number
          treatment_id?: number
          date?: string
          start_time?: string
          end_time?: string
          status?: 'confermato' | 'in attesa' | 'cancellato' | 'completato'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      doctors: {
        Row: {
          id: number
          name: string
          specialization: string
          color: string
          email: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          specialization: string
          color: string
          email?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          specialization?: string
          color?: string
          email?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      treatments: {
        Row: {
          id: number
          name: string
          duration: number
          price: number
          category: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          duration: number
          price: number
          category: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          duration?: number
          price?: number
          category?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          issue_date: string
          due_date: string
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          status: 'draft' | 'sent' | 'paid' | 'overdue'
          payment_method: string | null
          payment_date: string | null
          patient_id: string
          description: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          issue_date: string
          due_date: string
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          status?: 'draft' | 'sent' | 'paid' | 'overdue'
          payment_method?: string | null
          payment_date?: string | null
          patient_id: string
          description: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          issue_date?: string
          due_date?: string
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          status?: 'draft' | 'sent' | 'paid' | 'overdue'
          payment_method?: string | null
          payment_date?: string | null
          patient_id?: string
          description?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dental_procedures: {
        Row: {
          id: number
          patient_id: string
          date: string
          type: 'surgical' | 'non-surgical'
          procedure_type: string | null
          description: string | null
          teeth_involved: number[] | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          patient_id: string
          date: string
          type: 'surgical' | 'non-surgical'
          procedure_type?: string | null
          description?: string | null
          teeth_involved?: number[] | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          patient_id?: string
          date?: string
          type?: 'surgical' | 'non-surgical'
          procedure_type?: string | null
          description?: string | null
          teeth_involved?: number[] | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      medical_devices: {
        Row: {
          id: number
          procedure_id: number
          name: string
          use_date: string
          udi_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          procedure_id: number
          name: string
          use_date: string
          udi_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          procedure_id?: number
          name?: string
          use_date?: string
          udi_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patient_events: {
        Row: {
          id: number
          patient_id: string
          date: string
          time: string
          type: 'visita' | 'prescrizione' | 'analisi' | 'nota' | 'altro'
          title: string
          description: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          patient_id: string
          date: string
          time: string
          type: 'visita' | 'prescrizione' | 'analisi' | 'nota' | 'altro'
          title: string
          description: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          patient_id?: string
          date?: string
          time?: string
          type?: 'visita' | 'prescrizione' | 'analisi' | 'nota' | 'altro'
          title?: string
          description?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      event_attachments: {
        Row: {
          id: number
          event_id: number
          name: string
          type: string
          size: number
          url: string
          upload_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          event_id: number
          name: string
          type: string
          size: number
          url: string
          upload_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          event_id?: number
          name?: string
          type?: string
          size?: number
          url?: string
          upload_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      reminders: {
        Row: {
          id: number
          date: string
          time: string
          title: string
          text: string
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          date: string
          time: string
          title: string
          text: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          date?: string
          time?: string
          title?: string
          text?: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: number
          name: string
          category: string
          description: string | null
          quantity: number
          unit: string
          min_quantity: number
          price: number
          supplier: string | null
          location: string | null
          notes: string | null
          last_order: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          category: string
          description?: string | null
          quantity: number
          unit: string
          min_quantity: number
          price: number
          supplier?: string | null
          location?: string | null
          notes?: string | null
          last_order?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          category?: string
          description?: string | null
          quantity?: number
          unit?: string
          min_quantity?: number
          price?: number
          supplier?: string | null
          location?: string | null
          notes?: string | null
          last_order?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}