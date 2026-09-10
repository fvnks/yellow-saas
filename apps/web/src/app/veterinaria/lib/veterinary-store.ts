'use client';

export type Species = string;
export type Gender = 'macho' | 'hembra' | 'desconocido';

export interface VeterinarySpecies {
  id: string;
  key: string;
  name: string;
  category: 'pequeños_animales' | 'exoticos' | 'mayores_ganado' | 'silvestres';
  commonBreeds: string[];
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}
export type PatientStatus = 'active' | 'deceased' | 'adopted' | 'inactive';
export type AppointmentStatus = 'agendada' | 'confirmada' | 'en_espera' | 'en_atencion' | 'finalizada' | 'cancelada' | 'no_asistio';
export type ServiceCategory = 'consulta' | 'vacunacion' | 'desparasitacion' | 'cirugia' | 'hospitalizacion' | 'examen' | 'imagenologia' | 'peluqueria' | 'otro';

export interface VeterinaryClient {
  id: string;
  fullName: string;
  rut: string;
  phone: string;
  email: string;
  address: string;
  commune: string;
  city: string;
  secondaryContactName?: string;
  secondaryContactPhone?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
}

export interface VeterinaryPatient {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  name: string;
  species: Species;
  breed: string;
  gender: Gender;
  birthDate: string;
  color: string;
  currentWeightKg: number;
  microchip?: string;
  registrationNumber?: string;
  isSterilized: boolean;
  temperament?: string;
  allergies?: string;
  chronicConditions?: string;
  permanentMedications?: string;
  diet?: string;
  notes?: string;
  photoUrl?: string;
  status: PatientStatus;
  createdAt: string;
}

export interface VeterinaryProfessional {
  id: string;
  fullName: string;
  rut: string;
  professionalLicense: string;
  specialty: string;
  phone: string;
  email: string;
  role: 'veterinario' | 'tecnico' | 'asistente' | 'cirujano' | 'recepcion';
  status: 'active' | 'inactive';
}

export interface VeterinaryService {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  priceCLP: number;
  durationMinutes: number;
  requiresConsent: boolean;
  status: 'active' | 'inactive';
}

export interface VeterinaryRoom {
  id: string;
  name: string;
  type: 'box' | 'quirofano' | 'hospitalizacion' | 'laboratorio' | 'peluqueria';
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface VeterinaryAppointment {
  id: string;
  patientId: string;
  patientName: string;
  species: Species;
  clientId: string;
  clientName: string;
  clientPhone: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  roomId?: string;
  roomName?: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  durationMinutes: number;
  reason: string;
  notes?: string;
  status: AppointmentStatus;
}

export interface VeterinaryConsultation {
  id: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  species: Species;
  clientId: string;
  clientName: string;
  professionalId: string;
  professionalName: string;
  consultationDate: string;
  reasonForVisit: string;
  anamnesis: string;
  weightKg: number;
  temperatureC: number;
  heartRateBpm: number;
  respiratoryRateBpm: number;
  capillaryRefillTimeSec: number;
  mucousMembranes: string;
  bodyCondition: '1/5' | '2/5' | '3/5' | '4/5' | '5/5';
  physicalExamFindings: string;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string;
  presumptiveDiagnosis?: string;
  treatmentPlan: string;
  generalNotes?: string;
  status: 'draft' | 'completed' | 'cancelled';
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export type EvolutionType = 'consulta' | 'control' | 'procedimiento' | 'post_operatorio' | 'hospitalizacion' | 'examen';

export interface VeterinaryEvolution {
  id: string;
  patientId: string;
  patientName: string;
  consultationId?: string;
  type: EvolutionType;
  soap: SoapNote;
  weightKg?: number;
  temperatureC?: number;
  heartRateBpm?: number;
  respiratoryRateBpm?: number;
  professionalId: string;
  professionalName: string;
  evolutionDate: string;
  evolutionTime: string;
  diagnosis?: string;
  status: 'draft' | 'final';
  createdAt: string;
}

export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceCLP: number;
}

export interface VeterinaryEstimate {
  id: string;
  estimateNumber: string;
  patientId: string;
  patientName: string;
  species: Species;
  clientId: string;
  clientName: string;
  clientRut: string;
  professionalId: string;
  professionalName: string;
  issueDate: string;
  validUntil: string;
  items: EstimateItem[];
  currency: 'CLP' | 'UF';
  note?: string;
  status: 'borrador' | 'pendiente_aprobacion' | 'aprobado' | 'rechazado' | 'expirado' | 'convertido';
}

export type PaymentMethod = 'efectivo' | 'debito' | 'credito_webpay' | 'transbank_credito' | 'transferencia' | 'cheque' | 'mercadopago';

export interface PaymentRecord {
  id: string;
  estimateId?: string;
  invoiceId?: string;
  patientId: string;
  patientName: string;
  clientId: string;
  clientName: string;
  clientRut: string;
  paidAt: string;
  amountCLP: number;
  method: PaymentMethod;
  concept: string;
  referenceNumber?: string;
  partialOf?: string;
  status: 'completado' | 'pendiente' | 'reverso';
}

export interface VeterinaryInvoiceEstimate {
  id: string;
  invoiceNumber: string;
  estimateId: string;
  clientName: string;
  clientRut: string;
  patientName: string;
  issueDate: string;
  totalCLP: number;
  status: 'boleta_pagada' | 'factura_pagada' | 'pendiente';
  payments: PaymentRecord[];
}

export interface LabPanel {
  id: string;
  name: string;
  code: string;
  category: 'hematologia' | 'bioquimica' | 'endocrinologia' | 'urianalisis' | 'parasitologia' | 'citologia' | 'serologia' | 'otros';
  tests: LabTest[];
}

export interface LabTest {
  id: string;
  name: string;
  code: string;
  unit: string;
  referenceRange: string;
}

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  species: Species;
  clientId: string;
  clientName: string;
  clientRut: string;
  professionalId: string;
  professionalName: string;
  panelId: string;
  panelName: string;
  orderedDate: string;
  samplingDate?: string;
  sampleType: 'sangre' | 'orina' | 'heces' | 'raspado_piel' | 'frotis_sanguineo' | 'aspiracion' | 'otro';
  externalLab?: string;
  status: 'ordenada' | 'muestra_tomada' | 'en_proceso' | 'resultados_listos' | 'entregado' | 'cancelada';
  results?: LabResult[];
  notes?: string;
  priority: 'rutina' | 'urgencia' | 'estatica';
}

export interface LabResult {
  id: string;
  testId: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: 'bajo' | 'normal' | 'alto' | 'critico';
  note?: string;
}

export type ImagingStudyType =
  | 'radiografia'
  | 'ecografia'
  | 'tomografia'
  | 'resonancia'
  | 'endoscopia'
  | 'electrocardiograma'
  | 'otro';

export interface ImagingStudy {
  id: string;
  studyNumber: string;
  studyType: ImagingStudyType;
  patientId: string;
  patientName: string;
  species: Species;
  clientId: string;
  clientName: string;
  clientRut: string;
  professionalId: string;
  professionalName: string;
  studyDate: string;
  region: string;
  findings: string;
  conclusion: string;
  images: number;
  status: 'en_proceso' | 'informado' | 'disponible';
  modality?: string;
}

export interface PharmacyStockItem {
  id: string;
  name: string;
  sku: string;
  category: 'antibiotico' | 'antiinflamatorio' | 'analgesico' | 'antiparasitario' | 'vacuna' | 'suero' | 'anestesia' | 'cardiovascular' | 'dermatologico' | 'insumo';
  currentStock: number;
  unit: string;
  batchNumber: string;
  expirationDate: string;
  priceCLP: number;
  requiresPrescription: boolean;
  minStock: number;
  supplier?: string;
  location: string;
}

export interface PharmacyDispense {
  id: string;
  dispenseNumber: string;
  prescriptionId?: string;
  patientId: string;
  patientName: string;
  clientId: string;
  clientName: string;
  clientRut: string;
  professionalId: string;
  professionalName: string;
  dispenseDate: string;
  items: { itemId: string; name: string; quantity: number; priceCLP: number }[];
  totalCLP: number;
  status: 'pendiente' | 'despachado' | 'entregado' | 'anulado';
}

export interface VaccinationRecord {
  id: string;
  patientId: string;
  patientName: string;
  professionalId?: string;
  professionalName?: string;
  consultationId?: string;
  vaccineName: string;
  manufacturer: string;
  batchNumber: string;
  applicationDate: string;
  nextDueDate: string;
  dose: string;
  notes?: string;
}

export interface DewormingRecord {
  id: string;
  patientId: string;
  patientName: string;
  professionalId?: string;
  professionalName?: string;
  productName: string;
  type: 'interna' | 'externa' | 'ambas';
  dose: string;
  applicationDate: string;
  nextDueDate: string;
  notes?: string;
}

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  activeIngredient?: string;
  presentation?: string;
  dose: string;
  frequency: string;
  duration: string;
  route: 'oral' | 'topica' | 'inyectable' | 'oftalmica' | 'otica' | 'subcutanea';
  quantity?: string;
  specialInstructions?: string;
}

export interface Prescription {
  id: string;
  consultationId?: string;
  patientId: string;
  patientName: string;
  clientId: string;
  clientName: string;
  professionalId: string;
  professionalName: string;
  prescriptionDate: string;
  items: PrescriptionItem[];
  instructions: string;
  status: 'active' | 'dispensed' | 'cancelled';
}

export interface VeterinarySurgery {
  id: string;
  patientId: string;
  patientName: string;
  species: Species;
  clientId: string;
  clientName: string;
  surgeonId: string;
  surgeonName: string;
  anesthetistId?: string;
  anesthetistName?: string;
  surgeryName: string;
  scheduledDate: string;
  roomName: string;
  preOpEvaluation?: string;
  surgeryReport?: string;
  postOpInstructions?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface HospitalizationLog {
  id: string;
  logTime: string;
  professionalName: string;
  temperatureC?: number;
  heartRateBpm?: number;
  respiratoryRateBpm?: number;
  feeding?: string;
  hydration?: string;
  medicationGiven?: string;
  urinated?: boolean;
  defecated?: boolean;
  notes?: string;
}

export interface Hospitalization {
  id: string;
  patientId: string;
  patientName: string;
  species: Species;
  clientId: string;
  clientName: string;
  attendingVetId: string;
  attendingVetName: string;
  cageNumber: string;
  admissionDate: string;
  dischargeDate?: string;
  initialDiagnosis: string;
  dischargeSummary?: string;
  priority: 'baja' | 'media' | 'alta' | 'critica';
  status: 'active' | 'discharged' | 'transferred' | 'deceased';
  logs: HospitalizationLog[];
}

export interface Reminder {
  id: string;
  patientId: string;
  patientName: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  type: 'vacunacion' | 'desparasitacion' | 'control' | 'examen' | 'cirugia' | 'hospitalizacion' | 'otro';
  dueDate: string;
  title: string;
  description?: string;
  status: 'pending' | 'sent' | 'completed' | 'cancelled';
}

// Initial Empty Production Data
export const INITIAL_CLIENTS: VeterinaryClient[] = [];

export const INITIAL_SPECIES: VeterinarySpecies[] = [];

export const INITIAL_PATIENTS: VeterinaryPatient[] = [];

export const INITIAL_PROFESSIONALS: VeterinaryProfessional[] = [];

export const INITIAL_SERVICES: VeterinaryService[] = [];

export const INITIAL_ROOMS: VeterinaryRoom[] = [];

export const INITIAL_APPOINTMENTS: VeterinaryAppointment[] = [];

export const INITIAL_CONSULTATIONS: VeterinaryConsultation[] = [];

export const INITIAL_VACCINATIONS: VaccinationRecord[] = [];

export const INITIAL_DEWORMINGS: DewormingRecord[] = [];

export const INITIAL_REMINDERS: Reminder[] = [];

export const INITIAL_HOSPITALIZATIONS: Hospitalization[] = [];

export const INITIAL_EVOLUTIONS: VeterinaryEvolution[] = [];

export const INITIAL_LAB_PANELS: LabPanel[] = [];

export const INITIAL_ESTIMATES: VeterinaryEstimate[] = [];

export const INITIAL_PAYMENTS: PaymentRecord[] = [];

export const INITIAL_LAB_ORDERS: LabOrder[] = [];

export const INITIAL_IMAGING_STUDIES: ImagingStudy[] = [];

export const INITIAL_PHARMACY_STOCK: PharmacyStockItem[] = [];

export const INITIAL_PHARMACY_DISPENSES: PharmacyDispense[] = [];
