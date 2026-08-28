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

export const INITIAL_SPECIES: VeterinarySpecies[] = [
  {
    id: 'sp-001',
    key: 'perro',
    name: 'Canino (Perro)',
    category: 'pequeños_animales',
    commonBreeds: ['Golden Retriever', 'Pastor Alemán', 'Poodle', 'Bulldog Francés', 'Kuchel / Mestizo', 'Pug', 'Labrador'],
    description: 'Especie canina doméstica con regulación under Ley 21.020.',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'sp-002',
    key: 'gato',
    name: 'Felino (Gato)',
    category: 'pequeños_animales',
    commonBreeds: ['Mestizo Felino / DSH', 'Persa', 'Siames', 'Maine Coon', 'Bengalí', 'Sphynx'],
    description: 'Especie felina doméstica bajo programa microchip Ley 21.020.',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'sp-003',
    key: 'ave',
    name: 'Ave / Ornitología',
    category: 'exoticos',
    commonBreeds: ['Ninfa / Calopsita', 'Cacatúa', 'Perico Australiano', 'Agapornis', 'Canario', 'Loro'],
    description: 'Aves de compañía, exóticas u ornitología clínica.',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'sp-004',
    key: 'conejo',
    name: 'Lagomorfo (Conejo)',
    category: 'exoticos',
    commonBreeds: ['Cabeza de León', 'Holland Lop', 'Enano Holandés', 'Rex', 'Mestizo'],
    description: 'Cones de compañía con atención médica especializada en fermentación posterior.',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'sp-005',
    key: 'roedor',
    name: 'Roedor (Cobaya / Hámster / Chinchilla)',
    category: 'exoticos',
    commonBreeds: ['Cobaya / Cuy', 'Hámster Sirio', 'Hámster Ruso', 'Chinchilla', 'Rata Doméstica'],
    description: 'Pequeños mamíferos roedores domésticos.',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'sp-006',
    key: 'huron',
    name: 'Mustélido (Hurón / Ferret)',
    category: 'exoticos',
    commonBreeds: ['Hurón Sable', 'Hurón Albino', 'Hurón Panda', 'Hurón Canela'],
    description: 'Hurones domésticos de compañía y carnívoros estrictos.',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'sp-007',
    key: 'reptil',
    name: 'Reptil / Anfibio',
    category: 'exoticos',
    commonBreeds: ['Iguana Verde', 'Dragón Barbudo', 'Gecko Leopardo', 'Tortuga de Agua', 'Tortuga Terrestre'],
    description: 'Reptiles y anfibios exóticos mantenidos en terrarios.',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'sp-008',
    key: 'equino',
    name: 'Equino (Caballo / Mula)',
    category: 'mayores_ganado',
    commonBreeds: ['Caballo Chileno', 'Fina Sangre de Carrera (FSC)', 'Criollo', 'Percherón', 'Cuarto de Milla'],
    description: 'Medicina equina de deporte, trabajo y reproductor.',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'sp-009',
    key: 'bovino',
    name: 'Bovino (Vacuno / Lechero)',
    category: 'mayores_ganado',
    commonBreeds: ['Holstein / Overo Negro', 'Overo Colorado', 'Angus', 'Hereford', 'Wagyu'],
    description: 'Bovinos de carne y leche con control sanitario SAG y trazabilidad RUP.',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'sp-010',
    key: 'porcino',
    name: 'Porcino (Cerdo / Minipig)',
    category: 'mayores_ganado',
    commonBreeds: ['Minipig', 'Landrace', 'Yorkshire', 'Duroc'],
    description: 'Porcinos domésticos de compañía (Minipig) o producción.',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'sp-011',
    key: 'ovino_caprino',
    name: 'Ovino & Caprino (Oveja / Cabra)',
    category: 'mayores_ganado',
    commonBreeds: ['Suffolk Down', 'Merino Precoz', 'Cabra Saanen', 'Cabra Anglo-Nubian'],
    description: 'Pequeños rumiantes productores de leche, lana y carne.',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'sp-012',
    key: 'silvestre',
    name: 'Fauna Silvestre / Rehabilita',
    category: 'silvestres',
    commonBreeds: ['Puma Concolor', 'Zorro Chilla', 'Búho Magallánico', 'Condor Andino'],
    description: 'Ejemplares de fauna nativa o de centros de rehabilitación rescatados.',
    status: 'active',
    createdAt: '2025-01-01',
  },
];

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

export const INITIAL_LAB_PANELS: LabPanel[] = [
  {
    id: 'lpan-001',
    name: 'Hemograma Completo (CBC)',
    code: 'HEMO',
    category: 'hematologia',
    tests: [
      { id: 'lt-001', name: 'Hematocrito (HCT)', code: 'HCT', unit: '%', referenceRange: '37 - 55' },
      { id: 'lt-002', name: 'Hemoglobina (HGB)', code: 'HGB', unit: 'g/dL', referenceRange: '12.0 - 18.0' },
      { id: 'lt-003', name: 'Glóbulos Rojos (RBC)', code: 'RBC', unit: 'M/µL', referenceRange: '5.5 - 8.5' },
      { id: 'lt-004', name: 'Glóbulos Blancos (WBC)', code: 'WBC', unit: 'K/µL', referenceRange: '6.0 - 17.0' },
      { id: 'lt-005', name: 'Plaquetas (PLT)', code: 'PLT', unit: 'K/µL', referenceRange: '200 - 500' },
      { id: 'lt-006', name: 'Neutrófilos Segmentados', code: 'NEU', unit: '%', referenceRange: '60 - 77' },
      { id: 'lt-007', name: 'Linfocitos', code: 'LYM', unit: '%', referenceRange: '12 - 30' },
    ],
  },
  {
    id: 'lpan-002',
    name: 'Perfil Bioquímico (Rutina)',
    code: 'BIOQ',
    category: 'bioquimica',
    tests: [
      { id: 'lt-101', name: 'Glucosa', code: 'GLU', unit: 'mg/dL', referenceRange: '70 - 130' },
      { id: 'lt-102', name: 'Urea BUN', code: 'BUN', unit: 'mg/dL', referenceRange: '7 - 32' },
      { id: 'lt-103', name: 'Creatinina', code: 'CREA', unit: 'mg/dL', referenceRange: '0.5 - 1.5' },
      { id: 'lt-104', name: 'ALT/GPT', code: 'ALT', unit: 'U/L', referenceRange: '10 - 100' },
      { id: 'lt-105', name: 'AST/GOT', code: 'AST', unit: 'U/L', referenceRange: '10 - 60' },
      { id: 'lt-106', name: 'Proteínas Totales', code: 'TPRO', unit: 'g/dL', referenceRange: '5.4 - 7.8' },
    ],
  },
  {
    id: 'lpan-003',
    name: 'Urianálisis Completo',
    code: 'URIN',
    category: 'urianalisis',
    tests: [
      { id: 'lt-201', name: 'Densidad', code: 'DENS', unit: '', referenceRange: '1.015 - 1.045' },
      { id: 'lt-202', name: 'pH', code: 'PH', unit: '', referenceRange: '5.5 - 7.5' },
      { id: 'lt-203', name: 'Proteínas', code: 'PRO', unit: 'mg/dL', referenceRange: 'Negativo' },
      { id: 'lt-204', name: 'Glucosa', code: 'GLU2', unit: 'mg/dL', referenceRange: 'Negativo' },
      { id: 'lt-205', name: 'Hemoglobina', code: 'HGB2', unit: '', referenceRange: 'Negativo' },
    ],
  },
  {
    id: 'lpan-004',
    name: 'Perfil Tiroideo',
    code: 'TIRO',
    category: 'endocrinologia',
    tests: [
      { id: 'lt-301', name: 'T4 Total', code: 'T4', unit: 'µg/dL', referenceRange: '1.0 - 4.0' },
      { id: 'lt-302', name: 'TSH', code: 'TSH', unit: 'ng/mL', referenceRange: '0.03 - 0.6' },
    ],
  },
];

export const INITIAL_ESTIMATES: VeterinaryEstimate[] = [];

export const INITIAL_PAYMENTS: PaymentRecord[] = [];

export const INITIAL_LAB_ORDERS: LabOrder[] = [];

export const INITIAL_IMAGING_STUDIES: ImagingStudy[] = [];

export const INITIAL_PHARMACY_STOCK: PharmacyStockItem[] = [];

export const INITIAL_PHARMACY_DISPENSES: PharmacyDispense[] = [];
