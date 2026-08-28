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

// Initial Mock Data
export const INITIAL_CLIENTS: VeterinaryClient[] = [
  {
    id: 'cli-001',
    fullName: 'María José Valenzuela',
    rut: '15.482.910-K',
    phone: '+56 9 8765 4321',
    email: 'mj.valenzuela@gmail.com',
    address: 'Av. Providencia 1420, Apt 502',
    commune: 'Providencia',
    city: 'Santiago',
    secondaryContactName: 'Carlos Valenzuela',
    secondaryContactPhone: '+56 9 1122 3344',
    status: 'active',
    createdAt: '2025-01-15',
  },
  {
    id: 'cli-002',
    fullName: 'Gonzalo Morales Silva',
    rut: '12.839.401-4',
    phone: '+56 9 5544 3322',
    email: 'g.morales@empresa.cl',
    address: 'Calle Los Alerces 850',
    commune: 'Las Condes',
    city: 'Santiago',
    status: 'active',
    createdAt: '2025-02-01',
  },
  {
    id: 'cli-003',
    fullName: 'Camila Andrea Reyes',
    rut: '18.294.103-8',
    phone: '+56 9 9988 7766',
    email: 'camila.reyes@live.cl',
    address: 'Pasaje El Espino 412',
    commune: 'Ñuñoa',
    city: 'Santiago',
    status: 'active',
    createdAt: '2025-02-10',
  },
];

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

export const INITIAL_PATIENTS: VeterinaryPatient[] = [
  {
    id: 'pat-001',
    clientId: 'cli-001',
    clientName: 'María José Valenzuela',
    clientPhone: '+56 9 8765 4321',
    name: 'Apollo',
    species: 'perro',
    breed: 'Golden Retriever',
    gender: 'macho',
    birthDate: '2021-06-12',
    color: 'Dorado Claro',
    currentWeightKg: 32.5,
    microchip: '985141002938471',
    registrationNumber: 'REG-VET-2021-88',
    isSterilized: true,
    temperament: 'Dócil y cariñoso',
    allergies: 'Sensibilidad a pollo procesado',
    chronicConditions: 'Displasia cadera leve (controlada)',
    permanentMedications: 'Condroprotector 1 tab/día',
    diet: 'Alimento Súper Premium Salmon',
    notes: 'Miedo moderado a petardos.',
    status: 'active',
    createdAt: '2025-01-15',
  },
  {
    id: 'pat-002',
    clientId: 'cli-001',
    clientName: 'María José Valenzuela',
    clientPhone: '+56 9 8765 4321',
    name: 'Luna',
    species: 'gato',
    breed: 'Mestizo / DSH',
    gender: 'hembra',
    birthDate: '2022-09-04',
    color: 'Tricolor Calicó',
    currentWeightKg: 4.1,
    microchip: '985141009911223',
    isSterilized: true,
    temperament: 'Nerviosa al examen clínico',
    status: 'active',
    createdAt: '2025-01-20',
  },
  {
    id: 'pat-003',
    clientId: 'cli-002',
    clientName: 'Gonzalo Morales Silva',
    clientPhone: '+56 9 5544 3322',
    name: 'Max',
    species: 'perro',
    breed: 'Bulldog Francés',
    gender: 'macho',
    birthDate: '2023-03-20',
    color: 'Atigrado',
    currentWeightKg: 12.8,
    microchip: '985141005544332',
    isSterilized: false,
    temperament: 'Muy amigable',
    allergies: 'Dermatitis atópica',
    status: 'active',
    createdAt: '2025-02-01',
  },
  {
    id: 'pat-004',
    clientId: 'cli-003',
    clientName: 'Camila Andrea Reyes',
    clientPhone: '+56 9 9988 7766',
    name: 'Coco',
    species: 'conejo',
    breed: 'Minilop',
    gender: 'macho',
    birthDate: '2023-11-10',
    color: 'Blanco y Marrón',
    currentWeightKg: 1.8,
    isSterilized: true,
    status: 'active',
    createdAt: '2025-02-10',
  },
];

export const INITIAL_PROFESSIONALS: VeterinaryProfessional[] = [
  {
    id: 'pro-001',
    fullName: 'Dr. Sebastián Contreras P.',
    rut: '13.910.482-1',
    professionalLicense: 'COLVET-CL-4892',
    specialty: 'Medicina Interna Canina y Felina',
    phone: '+56 9 7711 2233',
    email: 'dr.contreras@yellowvet.cl',
    role: 'veterinario',
    status: 'active',
  },
  {
    id: 'pro-002',
    fullName: 'Dra. Andrea Morales Soto',
    rut: '16.102.948-5',
    professionalLicense: 'COLVET-CL-5912',
    specialty: 'Cirugía de Tejidos Blandos y Ortopedia',
    phone: '+56 9 6655 4433',
    email: 'dra.morales@yellowvet.cl',
    role: 'cirujano',
    status: 'active',
  },
  {
    id: 'pro-003',
    fullName: 'Téc. Paula Garrido B.',
    rut: '19.201.847-2',
    professionalLicense: 'TNV-8821',
    specialty: 'Asistencia y Laboratorio',
    phone: '+56 9 4433 2211',
    email: 'paula.garrido@yellowvet.cl',
    role: 'tecnico',
    status: 'active',
  },
];

export const INITIAL_SERVICES: VeterinaryService[] = [
  {
    id: 'srv-001',
    name: 'Consulta General Veterinaria',
    description: 'Examen físico completo, anamnesis y prescripción médica inicial.',
    category: 'consulta',
    priceCLP: 32000,
    durationMinutes: 30,
    requiresConsent: false,
    status: 'active',
  },
  {
    id: 'srv-002',
    name: 'Vacuna Séxtuple / Óctuple Canina',
    description: 'Vacunación inmunizante con examen físico previo.',
    category: 'vacunacion',
    priceCLP: 28000,
    durationMinutes: 20,
    requiresConsent: false,
    status: 'active',
  },
  {
    id: 'srv-003',
    name: 'Vacuna Triple Felina',
    description: 'Inmunización felina (Parvovirus, Calicivirus, Rinotraqueítis).',
    category: 'vacunacion',
    priceCLP: 26000,
    durationMinutes: 20,
    requiresConsent: false,
    status: 'active',
  },
  {
    id: 'srv-004',
    name: 'Vacuna Antirrábica Obligatoria (SII / Ley 21.020)',
    description: 'Vacunación antirrábica con emisión de certificado oficial de vacunación.',
    category: 'vacunacion',
    priceCLP: 22000,
    durationMinutes: 20,
    requiresConsent: false,
    status: 'active',
  },
  {
    id: 'srv-005',
    name: 'Limpieza Dental Ultrasonido (Perfil Profiláctico)',
    description: 'Destartraje ultrasónico bajo anestesia e higienización bucal.',
    category: 'cirugia',
    priceCLP: 110000,
    durationMinutes: 90,
    requiresConsent: true,
    status: 'active',
  },
  {
    id: 'srv-006',
    name: 'Esterilización / Orquiectomía / OVH Canina-Felina',
    description: 'Cirugía de esterilización con monitoreo multiparámetro y post-operatorio.',
    category: 'cirugia',
    priceCLP: 145000,
    durationMinutes: 120,
    requiresConsent: true,
    status: 'active',
  },
  {
    id: 'srv-007',
    name: 'Perfil Sanguíneo Completo (Hemograma + Bioquímica)',
    description: 'Examen de sangre en laboratorio clínico.',
    category: 'examen',
    priceCLP: 45000,
    durationMinutes: 15,
    requiresConsent: false,
    status: 'active',
  },
];

export const INITIAL_ROOMS: VeterinaryRoom[] = [
  { id: 'room-001', name: 'Box 1 - Consultas Generales', type: 'box', capacity: 1, status: 'active' },
  { id: 'room-002', name: 'Box 2 - Fisiatría y Exóticos', type: 'box', capacity: 1, status: 'active' },
  { id: 'room-003', name: 'Quirófano Principal', type: 'quirofano', capacity: 1, status: 'active' },
  { id: 'room-004', name: 'Sala Hospitalización Felinos', type: 'hospitalizacion', capacity: 6, status: 'active' },
  { id: 'room-005', name: 'Sala Hospitalización Caninos', type: 'hospitalizacion', capacity: 8, status: 'active' },
];

export const INITIAL_APPOINTMENTS: VeterinaryAppointment[] = [
  {
    id: 'apt-001',
    patientId: 'pat-001',
    patientName: 'Apollo',
    species: 'perro',
    clientId: 'cli-001',
    clientName: 'María José Valenzuela',
    clientPhone: '+56 9 8765 4321',
    professionalId: 'pro-001',
    professionalName: 'Dr. Sebastián Contreras P.',
    serviceId: 'srv-002',
    serviceName: 'Vacuna Séxtuple / Óctuple Canina',
    roomId: 'room-001',
    roomName: 'Box 1 - Consultas Generales',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:00',
    durationMinutes: 30,
    reason: 'Control anula y refuerzo de vacuna óctuple.',
    status: 'confirmada',
  },
  {
    id: 'apt-002',
    patientId: 'pat-003',
    patientName: 'Max',
    species: 'perro',
    clientId: 'cli-002',
    clientName: 'Gonzalo Morales Silva',
    clientPhone: '+56 9 5544 3322',
    professionalId: 'pro-002',
    professionalName: 'Dra. Andrea Morales Soto',
    serviceId: 'srv-001',
    serviceName: 'Consulta General Veterinaria',
    roomId: 'room-002',
    roomName: 'Box 2 - Fisiatría y Exóticos',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '11:30',
    durationMinutes: 30,
    reason: 'Eritema y picazón en pliegues cutáneos.',
    status: 'en_espera',
  },
  {
    id: 'apt-003',
    patientId: 'pat-002',
    patientName: 'Luna',
    species: 'gato',
    clientId: 'cli-001',
    clientName: 'María José Valenzuela',
    clientPhone: '+56 9 8765 4321',
    professionalId: 'pro-001',
    professionalName: 'Dr. Sebastián Contreras P.',
    serviceId: 'srv-003',
    serviceName: 'Vacuna Triple Felina',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '15:00',
    durationMinutes: 30,
    reason: 'Refuerzo triple felina y desparasitación.',
    status: 'agendada',
  },
];

export const INITIAL_CONSULTATIONS: VeterinaryConsultation[] = [
  {
    id: 'con-001',
    appointmentId: 'apt-001',
    patientId: 'pat-001',
    patientName: 'Apollo',
    species: 'perro',
    clientId: 'cli-001',
    clientName: 'María José Valenzuela',
    professionalId: 'pro-001',
    professionalName: 'Dr. Sebastián Contreras P.',
    consultationDate: '2025-02-15 11:00',
    reasonForVisit: 'Control sano y vacunación anual',
    anamnesis: 'Tutor reporta apetito normal, ánimo excelente, sin vómitos ni diarreas. Toma suplemento articular diario.',
    weightKg: 32.5,
    temperatureC: 38.4,
    heartRateBpm: 90,
    respiratoryRateBpm: 22,
    capillaryRefillTimeSec: 2,
    mucousMembranes: 'Rosadas y húmedas',
    bodyCondition: '3/5',
    physicalExamFindings: 'Sin alteraciones a la palpación abdominal. Frecuencia cardíaca rítmica sin soplos audibles. Mucosas sanas.',
    primaryDiagnosis: 'Paciente sano para inmunización',
    treatmentPlan: 'Se administra Vacuna Óctuple Canina Lote #48291. Próximo control anual en 2026.',
    generalNotes: 'Tolera procedimiento sin complicaciones.',
    status: 'completed',
  },
];

export const INITIAL_VACCINATIONS: VaccinationRecord[] = [
  {
    id: 'vac-001',
    patientId: 'pat-001',
    patientName: 'Apollo',
    professionalName: 'Dr. Sebastián Contreras P.',
    vaccineName: 'Óctuple Canina (Recombitek)',
    manufacturer: 'Boehringer Ingelheim',
    batchNumber: 'BI-882910',
    applicationDate: '2025-02-15',
    nextDueDate: '2026-02-15',
    dose: '1 ml SC',
    notes: 'Aplicada en zona interescapular.',
  },
  {
    id: 'vac-002',
    patientId: 'pat-001',
    patientName: 'Apollo',
    professionalName: 'Dr. Sebastián Contreras P.',
    vaccineName: 'Antirrábica Obligatoria (Rabisin)',
    manufacturer: 'Boehringer Ingelheim',
    batchNumber: 'RAB-99201',
    applicationDate: '2024-08-10',
    nextDueDate: '2025-08-10',
    dose: '1 ml SC',
    notes: 'Certificado oficial emitido.',
  },
];

export const INITIAL_DEWORMINGS: DewormingRecord[] = [
  {
    id: 'dew-001',
    patientId: 'pat-001',
    patientName: 'Apollo',
    professionalName: 'Dr. Sebastián Contreras P.',
    productName: 'Endogard 30kg',
    type: 'interna',
    dose: '1 comprimido',
    applicationDate: '2025-01-10',
    nextDueDate: '2025-04-10',
    notes: 'Desparasitación interna trimestral.',
  },
  {
    id: 'dew-002',
    patientId: 'pat-001',
    patientName: 'Apollo',
    professionalName: 'Dr. Sebastián Contreras P.',
    productName: 'Bravecto 20-40kg',
    type: 'externa',
    dose: '1 comprimido masticable',
    applicationDate: '2024-12-01',
    nextDueDate: '2025-03-01',
    notes: 'Protección garrapatas y pulgas (12 semanas).',
  },
];

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'rem-001',
    patientId: 'pat-001',
    patientName: 'Apollo',
    clientId: 'cli-001',
    clientName: 'María José Valenzuela',
    clientPhone: '+56 9 8765 4321',
    type: 'desparasitacion',
    dueDate: '2025-03-01',
    title: 'Desparasitación Externa Bravecto',
    description: 'Vence dosis de 12 semanas para protección de garrapatas.',
    status: 'pending',
  },
  {
    id: 'rem-002',
    patientId: 'pat-001',
    patientName: 'Apollo',
    clientId: 'cli-001',
    clientName: 'María José Valenzuela',
    clientPhone: '+56 9 8765 4321',
    type: 'vacunacion',
    dueDate: '2025-08-10',
    title: 'Vacuna Antirrábica Obligatoria',
    description: 'Refuerzo de vacuna antirrábica según certificado Ley 21.020.',
    status: 'pending',
  },
];

export const INITIAL_HOSPITALIZATIONS: Hospitalization[] = [
  {
    id: 'hosp-001',
    patientId: 'pat-003',
    patientName: 'Max',
    species: 'perro',
    clientId: 'cli-002',
    clientName: 'Gonzalo Morales Silva',
    attendingVetId: 'pro-001',
    attendingVetName: 'Dr. Sebastián Contreras P.',
    cageNumber: 'Jaula Caninos B-02',
    admissionDate: '2025-02-26 14:30',
    initialDiagnosis: 'Gastroenteritis agudas con deshidratación moderada (7%)',
    priority: 'alta',
    status: 'active',
    logs: [
      {
        id: 'log-001',
        logTime: '2025-02-26 15:00',
        professionalName: 'Dr. Sebastián Contreras P.',
        temperatureC: 39.1,
        heartRateBpm: 110,
        respiratoryRateBpm: 28,
        feeding: 'Ayuno programado 12h',
        hydration: 'Fluidoterapia Ringer Lactato 60 ml/h',
        medicationGiven: 'Ondansetrón 0.2mg/kg IV + Ranitidina',
        urinated: true,
        defecated: false,
        notes: 'Monitoreo de deshidratación cada 4 horas.',
      },
      {
        id: 'log-002',
        logTime: '2025-02-26 19:00',
        professionalName: 'Téc. Paula Garrido B.',
        temperatureC: 38.6,
        heartRateBpm: 95,
        respiratoryRateBpm: 24,
        feeding: 'Ayuno continuado',
        hydration: 'Fluidoterapia Ringer Lactato 50 ml/h',
        urinated: true,
        defecated: false,
        notes: 'Paciente más alerta. No presenta nuevos episodios de emesis.',
      },
    ],
  },
];

export const INITIAL_EVOLUTIONS: VeterinaryEvolution[] = [
  {
    id: 'ev-001',
    patientId: 'pat-001',
    patientName: 'Apollo',
    consultationId: 'cons-001',
    type: 'consulta',
    soap: {
      subjective: 'Tutor refiere que Apollo ha presentado vómito en 3 ocasiones desde ayer y una leve disminución de apetito. Deposiciones presentes y de consistencia habitual. Sin fiebre registrada por el tutor.',
      objective: 'Paciente alerta, BCS 3/5, T° 38.7°C, FC 96 lpm, FR 24 rpm. Deshidratación <5%. Abdomen blando no doloroso a la palpación. Mucosas rosadas y húmedas. Signo de la carretilla normal. No se palpan masas ni organomegalias.',
      assessment: 'Gastroenteritis aguda inespecífica. Se descarta cuerpo extraño por clínica y anamnesis; riesgo de pancreatitis baja. Sospecha de indiscreción dietética.',
      plan: 'Ayuno de 12 horas, luego dieta blanda (pollo + arroz). Maropitant 1mg/kg VO cada 24h por 3 días. Rehidratación oral. Reevaluar en 72h. Suspender si persiste emesis o aumenta letargo.',
    },
    weightKg: 32.5,
    temperatureC: 38.7,
    heartRateBpm: 96,
    respiratoryRateBpm: 24,
    professionalId: 'pro-001',
    professionalName: 'Dr. Sebastián Contreras P.',
    evolutionDate: '2025-02-26',
    evolutionTime: '11:20',
    diagnosis: 'Gastroenteritis aguda inespecífica (K39.9)',
    status: 'final',
    createdAt: '2025-02-26',
  },
  {
    id: 'ev-002',
    patientId: 'pat-001',
    patientName: 'Apollo',
    consultationId: 'cons-001',
    type: 'control',
    soap: {
      subjective: 'Tutor reporta que Apollo no ha presentado nuevos episodios de vómito y el apetito mejoró progresivamente al reintroducir la dieta.',
      objective: 'T° 38.5°C, FC 88 lpm, FR 20 rpm. Bien hidratado. Abdomen normal. Sin hallazgos relevantes.',
      assessment: 'Buena evolución clínica. Gastroenteritis resuelta.',
      plan: 'Transición gradual a dieta habitual. Continuar hidratación. Alta médica. Próximo control en 6 meses o antes ante cualquier signo.',
    },
    weightKg: 32.8,
    temperatureC: 38.5,
    heartRateBpm: 88,
    respiratoryRateBpm: 20,
    professionalId: 'pro-002',
    professionalName: 'Dra. Andrea Morales Soto',
    evolutionDate: '2025-03-01',
    evolutionTime: '10:05',
    diagnosis: 'Evolución favorable - Alta',
    status: 'final',
    createdAt: '2025-03-01',
  },
  {
    id: 'ev-003',
    patientId: 'pat-003',
    patientName: 'Max',
    type: 'hospitalizacion',
    soap: {
      subjective: 'Paciente hospitalizado por gastroenteritis aguda con deshidratación. Sin nuevos episodios de emesis durante el turno.',
      objective: 'EV 15:00: T° 39.1°C, FC 110 lpm, FR 28 rpm. EV 19:00: T° 38.6°C, FC 95 lpm, FR 24 rpm. Bien hidratado con fluidoterapia. Abdomen blando.',
      assessment: 'Gastroenteritis aguda en vías de resolución. Deshidratación compensada.',
      plan: 'Continuar fluidoterapia Ringer Lactato. Ayuno programado. Monitoreo c/4h. Reintroducción gradual de dieta en 12-24h.',
    },
    weightKg: 28.4,
    temperatureC: 38.6,
    heartRateBpm: 95,
    respiratoryRateBpm: 24,
    professionalId: 'pro-001',
    professionalName: 'Dr. Sebastián Contreras P.',
    evolutionDate: '2025-02-26',
    evolutionTime: '19:30',
    diagnosis: 'Gastroenteritis aguda - Hospitalización',
    status: 'final',
    createdAt: '2025-02-26',
  },
];

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

export const INITIAL_ESTIMATES: VeterinaryEstimate[] = [
  {
    id: 'est-001',
    estimateNumber: 'COT-2025-001',
    patientId: 'pat-001',
    patientName: 'Apollo',
    species: 'perro',
    clientId: 'cli-001',
    clientName: 'María José Valenzuela',
    clientRut: '15.482.910-K',
    professionalId: 'pro-001',
    professionalName: 'Dr. Sebastián Contreras P.',
    issueDate: '2025-02-20',
    validUntil: '2025-03-20',
    items: [
      { id: 'ei-001', description: 'Limpieza dental con anestesia inhalatoria', quantity: 1, unitPriceCLP: 85000 },
      { id: 'ei-002', description: 'Radiografía dental (periapical)', quantity: 3, unitPriceCLP: 15000 },
      { id: 'ei-003', description: 'Exámenes pre-anestésicos (Hemograma + Bioquímica)', quantity: 1, unitPriceCLP: 42000 },
    ],
    currency: 'CLP',
    note: 'Paciente con cálculo dental leve. Se recomienda intervalorar dosis de sedación según peso.',
    status: 'aprobado',
  },
  {
    id: 'est-002',
    estimateNumber: 'COT-2025-002',
    patientId: 'pat-002',
    patientName: 'Luna',
    species: 'gato',
    clientId: 'cli-001',
    clientName: 'María José Valenzuela',
    clientRut: '15.482.910-K',
    professionalId: 'pro-002',
    professionalName: 'Dra. Andrea Morales Soto',
    issueDate: '2025-02-24',
    validUntil: '2025-03-24',
    items: [
      { id: 'ei-004', description: 'Castración (Ovariohisterectomía) felino', quantity: 1, unitPriceCLP: 69000 },
      { id: 'ei-005', description: 'Chip de identificación electrónica Ley 21.020', quantity: 1, unitPriceCLP: 15000 },
      { id: 'ei-006', description: 'Analgesia post operatoria (5 días)', quantity: 1, unitPriceCLP: 12500 },
    ],
    currency: 'CLP',
    note: 'Incluye control post operatorio de 7 días y alta médica.',
    status: 'pendiente_aprobacion',
  },
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-001',
    estimateId: 'est-001',
    patientId: 'pat-001',
    patientName: 'Apollo',
    clientId: 'cli-001',
    clientName: 'María José Valenzuela',
    clientRut: '15.482.910-K',
    paidAt: '2025-02-20 11:45',
    amountCLP: 80000,
    method: 'transferencia',
    concept: 'Anticipo (50%) - Limpieza dental Apollo',
    referenceNumber: 'TRX-88213',
    status: 'completado',
  },
];

export const INITIAL_LAB_ORDERS: LabOrder[] = [
  {
    id: 'lab-001',
    orderNumber: 'LAB-2025-001',
    patientId: 'pat-001',
    patientName: 'Apollo',
    species: 'perro',
    clientId: 'cli-001',
    clientName: 'María José Valenzuela',
    clientRut: '15.482.910-K',
    professionalId: 'pro-001',
    professionalName: 'Dr. Sebastián Contreras P.',
    panelId: 'lpan-001',
    panelName: 'Hemograma Completo (CBC)',
    orderedDate: '2025-02-18',
    samplingDate: '2025-02-18',
    sampleType: 'sangre',
    status: 'resultados_listos',
    priority: 'rutina',
    results: [
      { id: 'lr-001', testId: 'lt-001', testName: 'Hematocrito (HCT)', value: '48', unit: '%', referenceRange: '37 - 55', flag: 'normal' },
      { id: 'lr-002', testId: 'lt-002', testName: 'Hemoglobina (HGB)', value: '16.5', unit: 'g/dL', referenceRange: '12.0 - 18.0', flag: 'normal' },
      { id: 'lr-003', testId: 'lt-003', testName: 'Glóbulos Rojos (RBC)', value: '7.1', unit: 'M/µL', referenceRange: '5.5 - 8.5', flag: 'normal' },
      { id: 'lr-004', testId: 'lt-004', testName: 'Glóbulos Blancos (WBC)', value: '12.4', unit: 'K/µL', referenceRange: '6.0 - 17.0', flag: 'normal' },
      { id: 'lr-005', testId: 'lt-005', testName: 'Plaquetas (PLT)', value: '310', unit: 'K/µL', referenceRange: '200 - 500', flag: 'normal' },
    ],
  },
];

export const INITIAL_IMAGING_STUDIES: ImagingStudy[] = [
  {
    id: 'img-001',
    studyNumber: 'IMG-2025-001',
    studyType: 'radiografia',
    patientId: 'pat-001',
    patientName: 'Apollo',
    species: 'perro',
    clientId: 'cli-001',
    clientName: 'María José Valenzuela',
    clientRut: '15.482.910-K',
    professionalId: 'pro-001',
    professionalName: 'Dr. Sebastián Contreras P.',
    studyDate: '2025-02-15',
    region: 'Abdomen (Lateral y VD)',
    findings: 'Se observa radiopacidad de tejidos blandos a nivel de vesícula biliar. Leve hepatomegalia difusa. Sin evidencia de urolitiasis ni gas libre intraabdominal.',
    conclusion: 'Hepatomegalia leve difusa, compatible con hepatopatía reactiva/inflamatoria. Se recomienda perfil bioquímico hepático.',
    images: 2,
    status: 'informado',
    modality: 'Radiografía digital directa',
  },
  {
    id: 'img-002',
    studyNumber: 'IMG-2025-002',
    studyType: 'ecografia',
    patientId: 'pat-002',
    patientName: 'Luna',
    species: 'gato',
    clientId: 'cli-001',
    clientName: 'María José Valenzuela',
    clientRut: '15.482.910-K',
    professionalId: 'pro-002',
    professionalName: 'Dra. Andrea Morales Soto',
    studyDate: '2025-02-22',
    region: 'Abdomen completo',
    findings: 'Riñones de tamaño normal, parénquima homogéneo. Vejiga con pequeña cantidad de sedimento ecogénico. Hígado con ecotextura homogénea. No se evidencian masas.',
    conclusion: 'Estudio ecográfico abdominal sin alteraciones significativas. Sedimento vesical leve, probable cistitis incipiente.',
    images: 6,
    status: 'disponible',
    modality: 'Ecógrafo convex 5MHz',
  },
];

export const INITIAL_PHARMACY_STOCK: PharmacyStockItem[] = [
  { id: 'ph-01', name: 'Amoxicilina + Ac. Clavulánico 250mg', sku: 'VET-AMOX-250', category: 'antibiotico', currentStock: 45, unit: 'comprimidos', batchNumber: 'LOTE-88491', expirationDate: '2026-08-15', priceCLP: 1200, requiresPrescription: true, minStock: 20, location: 'Bodega A - Pasillo 1' },
  { id: 'ph-02', name: 'Meloxicam 0.5mg/ml Inyectable', sku: 'VET-MELOX-05', category: 'antiinflamatorio', currentStock: 12, unit: 'frascos 10ml', batchNumber: 'LOTE-99201', expirationDate: '2026-03-30', priceCLP: 14500, requiresPrescription: true, minStock: 5, supplier: 'VetPharma Chile', location: 'Bodega A - Nevera' },
  { id: 'ph-03', name: 'Ondansetrón 2mg/ml Inyectable', sku: 'VET-OND-02', category: 'analgesico', currentStock: 8, unit: 'ampollas', batchNumber: 'LOTE-77123', expirationDate: '2025-11-20', priceCLP: 3800, requiresPrescription: true, minStock: 10, location: 'Bodega A - Pasillo 2' },
  { id: 'ph-04', name: 'Endogard 30kg Desparasitante', sku: 'VET-ENDG-30', category: 'antiparasitario', currentStock: 60, unit: 'comprimidos', batchNumber: 'LOTE-11029', expirationDate: '2027-01-10', priceCLP: 4500, requiresPrescription: false, minStock: 30, supplier: 'MSD Salud Animal', location: 'Bodega B - Estante 3' },
  { id: 'ph-05', name: 'Bravecto 20-40kg Masticable', sku: 'VET-BRAV-40', category: 'antiparasitario', currentStock: 15, unit: 'cajas', batchNumber: 'LOTE-33412', expirationDate: '2026-10-05', priceCLP: 34900, requiresPrescription: false, minStock: 8, supplier: 'MSD Salud Animal', location: 'Bodega B - Estante 3' },
  { id: 'ph-06', name: 'Doxiciclina 100mg', sku: 'VET-DOXI-100', category: 'antibiotico', currentStock: 4, unit: 'comprimidos', batchNumber: 'LOTE-22091', expirationDate: '2026-02-28', priceCLP: 950, requiresPrescription: true, minStock: 25, location: 'Bodega A - Pasillo 1' },
  { id: 'ph-07', name: 'Suero Ringer Lactato 500ml', sku: 'VET-RL-500', category: 'suero', currentStock: 30, unit: 'bolsas', batchNumber: 'LOTE-9912', expirationDate: '2027-06-01', priceCLP: 3200, requiresPrescription: true, minStock: 15, supplier: 'Baxter Chile', location: 'Bodega A - Pasillo 3' },
  { id: 'ph-08', name: 'Ketamina 100mg/ml', sku: 'VET-KETA-100', category: 'anestesia', currentStock: 3, unit: 'frascos', batchNumber: 'LOTE-55123', expirationDate: '2025-12-15', priceCLP: 24800, requiresPrescription: true, minStock: 4, supplier: 'Farma Vet', location: 'Bodega A - Farmacia Restringida' },
];

export const INITIAL_PHARMACY_DISPENSES: PharmacyDispense[] = [
  {
    id: 'disp-001',
    dispenseNumber: 'DESP-2025-001',
    patientId: 'pat-001',
    patientName: 'Apollo',
    clientId: 'cli-001',
    clientName: 'María José Valenzuela',
    clientRut: '15.482.910-K',
    professionalId: 'pro-001',
    professionalName: 'Dr. Sebastián Contreras P.',
    dispenseDate: '2025-02-15',
    items: [
      { itemId: 'ph-01', name: 'Amoxicilina + Ac. Clavulánico 250mg', quantity: 20, priceCLP: 1200 },
      { itemId: 'ph-02', name: 'Meloxicam 0.5mg/ml Inyectable', quantity: 1, priceCLP: 14500 },
    ],
    totalCLP: 38500,
    status: 'entregado',
  },
];
