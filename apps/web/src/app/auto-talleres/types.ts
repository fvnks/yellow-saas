export type VehicleStatus = 'active' | 'inactive' | 'sold';
export type FuelType = 'naftero' | 'diesel' | 'híbrido' | 'eléctrico' | 'gas';
export type TransmissionType = 'manual' | 'automatica' | 'cvt' | 'semiautomatica';
export type PlateType = 'normal' | 'verde' | 'negra' | 'diplomatica' | 'defensa' | 'temporal';

export interface Vehicle {
  id: string;
  company_id: string;
  client_id: string;
  plate: string;
  plate_type: PlateType;
  vin?: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  fuel_type: FuelType;
  transmission: TransmissionType;
  mileage: number;
  engine_capacity?: string;
  serial_number?: string;
  chassis_number?: string;
  observation?: string;
  status: VehicleStatus;
  created_at: string;
  updated_at: string;
}

export type WorkOrderStatus =
  | 'checkin'
  | 'diagnostic'
  | 'estimated'
  | 'approved'
  | 'waiting_parts'
  | 'in_progress'
  | 'quality_check'
  | 'ready'
  | 'delivered'
  | 'invoiced'
  | 'cancelled';

export type Priority = 'baja' | 'normal' | 'alta' | 'urgente';
export type ItemType = 'labor' | 'part' | 'service' | 'product' | 'fee';
export type InspectionType = 'check_in' | 'pre_repair' | 'post_repair' | 'delivery';
export type FuelLevel = 'lleno' | '3/4' | '1/2' | '1/4' | 'vacío';
export type InspectionZone = 'frontal' | 'trasera' | 'lateral_izq' | 'lateral_der' | 'interior' | 'motor' | 'ruedas' | 'tablero' | 'otro';

export interface WorkOrderItem {
  id?: string;
  item_type: ItemType;
  description: string;
  quantity: number;
  unit_price: number;
  discount_pct: number;
  subtotal: number;
  part_id?: string;
  labor_technician_id?: string;
  labor_hours?: number;
  labor_rate_per_hour?: number;
  notes?: string;
  sort_order?: number;
}

export interface WorkOrder {
  id: string;
  company_id: string;
  order_number: string;
  vehicle_id: string;
  client_id: string;
  service_writer_id?: string;
  bay_id?: string;
  priority: Priority;
  status: WorkOrderStatus;
  checkin_date: string;
  estimated_completion_date?: string;
  actual_completion_date?: string;
  customer_complaint?: string;
  diagnosis?: string;
  notes?: string;
  subtotal: number;
  iva_pct: number;
  iva_amount: number;
  discount_pct: number;
  discount_amount: number;
  total: number;
  dte_id?: string;
  items?: WorkOrderItem[];
  vehicle?: Vehicle;
  client?: { id: string; full_name: string; rut: string; email?: string; phone?: string };
  created_at: string;
  updated_at: string;
}

export type EstimateStatus =
  | 'borrador'
  | 'pendiente_aprobacion'
  | 'aprobado'
  | 'rechazado'
  | 'expirado'
  | 'convertido_a_ot';

export interface EstimateItem {
  id?: string;
  item_type: ItemType;
  description: string;
  quantity: number;
  unit_price: number;
  discount_pct: number;
  subtotal: number;
  part_id?: string;
  labor_hours?: number;
  labor_rate_per_hour?: number;
  notes?: string;
  sort_order?: number;
}

export interface Estimate {
  id: string;
  company_id: string;
  estimate_number: string;
  work_order_id?: string;
  vehicle_id: string;
  client_id: string;
  issue_date: string;
  valid_until?: string;
  subtotal: number;
  iva_pct: number;
  iva_amount: number;
  discount_pct: number;
  discount_amount: number;
  total: number;
  status: EstimateStatus;
  approved_at?: string;
  approved_by_ip?: string;
  client_notes?: string;
  shop_terms?: string;
  note?: string;
  items?: EstimateItem[];
  created_at: string;
  updated_at: string;
}

export interface Technician {
  id: string;
  company_id: string;
  user_id?: string;
  rut?: string;
  full_name: string;
  phone?: string;
  email?: string;
  specialization?: string;
  hourly_rate: number;
  status: 'active' | 'inactive' | 'on_leave';
  created_at: string;
  updated_at: string;
}

export interface Bay {
  id: string;
  company_id: string;
  name: string;
  number: string;
  type: 'general' | 'elevador' | 'alineacion' | 'pintura' | 'chapa' | 'motor' | 'express';
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance' | 'inactive';
  current_order_id?: string;
  created_at: string;
  updated_at: string;
}

export interface InspectionPhoto {
  id: string;
  photo_url: string;
  description?: string;
  zone: InspectionZone;
  sort_order: number;
}

export interface Inspection {
  id: string;
  company_id: string;
  work_order_id?: string;
  vehicle_id: string;
  client_id: string;
  inspection_type: InspectionType;
  inspector_name?: string;
  mileage_at_inspection?: number;
  fuel_level?: FuelLevel;
  exterior_condition?: string;
  interior_condition?: string;
  damage_notes?: string;
  existing_scratches?: string;
  tire_condition?: string;
  lights_working?: boolean;
  wipers_working?: boolean;
  ac_working?: boolean;
  dashboard_warnings?: boolean;
  general_notes?: string;
  status: 'draft' | 'finalized';
  photos?: InspectionPhoto[];
  created_at: string;
}

export interface PartsOrder {
  id: string;
  company_id: string;
  order_number: string;
  work_order_id?: string;
  supplier_id?: string;
  requested_by?: string;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  status: 'solicitado' | 'pedido' | 'en_transito' | 'recibido' | 'cancelado' | 'devuelto';
  total_cost: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TimeLog {
  id: string;
  company_id: string;
  work_order_id: string;
  technician_id: string;
  task_description?: string;
  start_time: string;
  end_time?: string;
  total_minutes: number;
  status: 'active' | 'paused' | 'completed';
  notes?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  company_id: string;
  work_order_id?: string;
  vehicle_id: string;
  client_id: string;
  technician_id?: string;
  bay_id?: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  appointment_type: 'reparacion' | 'mantencion' | 'diagnostico' | 'inspeccion' | 'entrega';
  status: 'agendado' | 'confirmado' | 'en_curso' | 'completado' | 'cancelado' | 'no_asistio';
  notes?: string;
  created_at: string;
}

export type ServiceCategory =
  | 'mantencion'
  | 'reparacion'
  | 'diagnostico'
  | 'chapa_pintura'
  | 'electricidad'
  | 'suspension'
  | 'frenos'
  | 'motor'
  | 'transmision'
  | 'otro';

export interface Service {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  category: ServiceCategory;
  estimated_hours: number;
  base_price: number;
  hourly_rate: number;
  requires_estimates: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
