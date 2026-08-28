'use client';

export type Species = 'perro' | 'gato' | 'ave' | 'conejo' | 'roedor' | 'reptil' | 'exotico' | 'otro';
export type Gender = 'macho' | 'hembra' | 'desconocido';
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
