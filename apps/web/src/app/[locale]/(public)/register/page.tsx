'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import { Button, Input } from '@yellow-erp/ui';
import AuthPanel from '@/components/auth/AuthPanel';

function PasswordStrength({ password }: { password: string }) {
 const getStrength = (pw: string): { score: number; label: string; color: string } => {
 let score = 0;
 if (pw.length >= 8) score++;
 if (/[A-Z]/.test(pw)) score++;
 if (/[a-z]/.test(pw)) score++;
 if (/\d/.test(pw)) score++;
 if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) score++;

 if (score <= 1) return { score, label: 'Débil', color: 'bg-[#e24444]' };
 if (score <= 2) return { score, label: 'Regular', color: 'bg-apricot' };
 if (score <= 3) return { score, label: 'Buena', color: 'bg-cornflower' };
 return { score, label: 'Fuerte', color: 'bg-forest' };
 };

 if (!password) return null;

 const { score, label, color } = getStrength(password);

 return (
 <div className="mt-2 space-y-1.5">
 <div className="flex gap-1.5">
 {[1, 2, 3, 4, 5].map((i) => (
 <div
 key={i}
 className={`h-1 flex-1 rounded-full transition-all duration-300 ${
 i <= score ? color : 'bg-mist'
 }`}
 />
 ))}
 </div>
 <p className="text-[11px] text-iron">{label}</p>
 </div>
 );
}

function RegisterForm() {
 const router = useRouter();
 const [formData, setFormData] = useState({
 companyName: '',
 email: '',
 password: '',
 confirmPassword: '',
 fullName: '',
 phone: '',
 });
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [registered, setRegistered] = useState(false);
 const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

 const containerVariants: Variants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: { staggerChildren: 0.06, delayChildren: 0.05 },
 },
 };

 const itemVariants: Variants = {
 hidden: { opacity: 0, y: 10 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { type: 'spring', stiffness: 400, damping: 30 },
 },
 };

 const validateForm = () => {
 const errors: Record<string, string> = {};

 if (!formData.companyName) {
 errors.companyName = 'El nombre de la empresa es requerido';
 } else if (formData.companyName.length < 2) {
 errors.companyName = 'El nombre debe tener al menos 2 caracteres';
 }

 if (!formData.email) {
 errors.email = 'El correo electrónico es requerido';
 } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
 errors.email = 'El correo electrónico es inválido';
 }

 if (!formData.password) {
 errors.password = 'La contraseña es requerida';
 } else if (formData.password.length < 8) {
 errors.password = 'La contraseña debe tener al menos 8 caracteres';
 } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
 errors.password = 'La contraseña debe incluir mayúsculas, minúsculas, números y un carácter especial';
 }

 if (!formData.confirmPassword) {
 errors.confirmPassword = 'La confirmación de contraseña es requerida';
 } else if (formData.confirmPassword !== formData.password) {
 errors.confirmPassword = 'Las contraseñas no coinciden';
 }

 if (!formData.fullName) {
 errors.fullName = 'El nombre completo es requerido';
 } else if (formData.fullName.length < 3) {
 errors.fullName = 'El nombre debe tener al menos 3 caracteres';
 }

 setFieldErrors(errors);
 return Object.keys(errors).length === 0;
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError('');

 if (!validateForm()) return;

 setLoading(true);

 try {
 const response = await fetch('/api/auth/register', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(formData),
 });

 const data = await response.json();

 if (!response.ok) {
 throw new Error(data.error || 'Error en el registro');
 }

 setRegistered(true);
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Error desconocido');
 } finally {
 setLoading(false);
 }
 };

 const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
 setFormData(prev => ({ ...prev, [field]: e.target.value }));
 if (fieldErrors[field]) {
 setFieldErrors(prev => ({ ...prev, [field]: '' }));
 }
 };

 if (registered) {
 return (
 <div className="min-h-screen bg-cloud flex items-center justify-center p-4">
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
 className="w-full max-w-md text-center"
 >
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
 className="w-16 h-16 bg-mint/30 rounded-2xl flex items-center justify-center mx-auto mb-6"
 >
 <CheckCircle2 className="w-8 h-8 text-forest" />
 </motion.div>
 <h1 className="text-2xl font-bold text-ink">¡Cuenta creada!</h1>
 <p className="text-slate-text mt-3 text-sm">
 Tu cuenta fue creada exitosamente. Ahora puedes iniciar sesión con tu correo y contraseña.
 </p>
 <motion.button
 whileTap={{ scale: 0.98 }}
 onClick={() => router.push('/login')}
 className="mt-8 w-full rounded-[160px] bg-monday-violet hover:bg-monday-violet-hover text-white px-4 py-3 text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2"
 >
 <ShieldCheck className="w-4 h-4" />
 Ir a Iniciar Sesión
 </motion.button>
 </motion.div>
 </div>
 );
 }

 return (
 <div className="flex min-h-screen w-full bg-cloud font-sans text-ink antialiased selection:bg-monday-violet/10 lg:flex-row">
 {/* Left Image Panel */}
 <AuthPanel />

 {/* Right Form Panel */}
 <div className="flex w-full flex-col items-center justify-center p-6 sm:p-12 lg:w-1/2">
 {/* Mobile logo */}
 <div className="lg:hidden mb-8 flex items-center gap-3">
 <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'conic-gradient(from 270deg, #8181ff 15%, #33dbdb 40%, #33d58e 55%, #ffd633 65%, #fc527d 85%, #8181ff 100%)' }}>
 <div className="w-8 h-8 bg-snow rounded-full flex items-center justify-center">
 <Building2 className="w-5 h-5 text-monday-violet" />
 </div>
 </div>
 <span className="text-xl font-bold text-ink">Yellow ERP</span>
 </div>

 <motion.div
 variants={containerVariants}
 initial="hidden"
 animate="visible"
 className="w-full max-w-[440px]"
 >
 {/* Title */}
 <motion.div variants={itemVariants} className="mb-8">
 <h1 className="mb-3 text-[36px] font-bold leading-[1.05] tracking-tight text-ink">
 Crea tu cuenta
 </h1>
 <p className="text-[15px] text-slate-text text-balance">
 Comienza tu prueba gratuita de 14 días. Sin tarjeta de crédito.
 </p>
 </motion.div>

 {error && (
 <motion.div
 variants={itemVariants}
 role="alert"
 className="mb-5 flex items-center gap-2 p-3 bg-[#e24444]/5 border border-[#e24444]/20 rounded-md text-[#e24444] text-sm"
 >
 <AlertCircle className="w-4 h-4 flex-shrink-0" />
 {error}
 </motion.div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <motion.div variants={itemVariants}>
 <Input
 label="Nombre de la Empresa"
 type="text"
 value={formData.companyName}
 onChange={handleInputChange('companyName')}
 placeholder="Acme SpA"
 required
 error={fieldErrors.companyName}
 />
 </motion.div>

 <motion.div variants={itemVariants}>
 <Input
 label="Nombre Completo"
 type="text"
 value={formData.fullName}
 onChange={handleInputChange('fullName')}
 placeholder="Juan Pérez"
 required
 error={fieldErrors.fullName}
 />
 </motion.div>

 <motion.div variants={itemVariants}>
 <Input
 label="Correo Electrónico"
 type="email"
 value={formData.email}
 onChange={handleInputChange('email')}
 placeholder="tu@empresa.cl"
 required
 error={fieldErrors.email}
 />
 </motion.div>

 <motion.div variants={itemVariants}>
 <Input
 label="Teléfono (opcional)"
 type="tel"
 value={formData.phone}
 onChange={handleInputChange('phone')}
 placeholder="+56 2 1234 5678"
 />
 </motion.div>

 <motion.div variants={itemVariants} className="relative sm:col-span-2">
 <Input
 label="Contraseña"
 type={showPassword ? 'text' : 'password'}
 value={formData.password}
 onChange={handleInputChange('password')}
 placeholder="••••••••"
 required
 error={fieldErrors.password}
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-[38px] text-iron hover:text-ink transition-colors"
 aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
 >
 {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
 </button>
 <PasswordStrength password={formData.password} />
 </motion.div>

 <motion.div variants={itemVariants} className="relative sm:col-span-2">
 <Input
 label="Confirmar Contraseña"
 type={showConfirmPassword ? 'text' : 'password'}
 value={formData.confirmPassword}
 onChange={handleInputChange('confirmPassword')}
 placeholder="••••••••"
 required
 error={fieldErrors.confirmPassword}
 />
 <button
 type="button"
 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
 className="absolute right-3 top-[38px] text-iron hover:text-ink transition-colors"
 aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
 >
 {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
 </button>
 </motion.div>
 </div>

 <motion.div variants={itemVariants} className="bg-cloud p-4 rounded-md border border-mist">
 <p className="text-sm text-ink font-medium mb-2">La contraseña debe incluir:</p>
 <ul className="text-xs text-slate-text space-y-1">
 <li className="flex items-center gap-2">
 <CheckCircle2 className="w-3 h-3 text-forest flex-shrink-0" />
 <span>Al menos 8 caracteres</span>
 </li>
 <li className="flex items-center gap-2">
 <CheckCircle2 className="w-3 h-3 text-forest flex-shrink-0" />
 <span>Una letra mayúscula y una minúscula</span>
 </li>
 <li className="flex items-center gap-2">
 <CheckCircle2 className="w-3 h-3 text-forest flex-shrink-0" />
 <span>Al menos un número</span>
 </li>
 <li className="flex items-center gap-2">
 <CheckCircle2 className="w-3 h-3 text-forest flex-shrink-0" />
 <span>Al menos un carácter especial (@$!%*?&)</span>
 </li>
 </ul>
 </motion.div>

 <motion.div variants={itemVariants} className="flex items-start">
 <input
 type="checkbox"
 id="terms"
 className="w-4 h-4 text-monday-violet border-mist rounded focus:ring-monday-violet focus:ring-2 mt-0.5"
 required
 />
 <label htmlFor="terms" className="ml-2 text-sm text-ink">
 Acepto los{' '}
 <a href="/terms" className="text-monday-violet hover:text-monday-violet-hover font-medium underline underline-offset-2">
 Términos de Servicio
 </a>
 {' '}y la{' '}
 <a href="/privacy" className="text-monday-violet hover:text-monday-violet-hover font-medium underline underline-offset-2">
 Política de Privacidad
 </a>
 </label>
 </motion.div>

 <motion.div variants={itemVariants}>
 <Button type="submit" className="w-full shadow-sm" loading={loading}>
 Crear Cuenta Gratuita
 </Button>
 </motion.div>
 </form>

 {/* Footer */}
 <motion.div variants={itemVariants} className="mt-8 text-center text-[14px] text-slate-text">
 ¿Ya tienes una cuenta?{' '}
 <Link href="/login" className="font-semibold text-ink hover:text-monday-violet transition-colors underline underline-offset-2">
 Iniciar Sesión
 </Link>
 </motion.div>
 </motion.div>
 </div>
 </div>
 );
}

export default function RegisterPage() {
 return (
 <Suspense fallback={<div className="min-h-screen bg-cloud flex items-center justify-center"><p className="text-slate-text">Cargando...</p></div>}>
 <RegisterForm />
 </Suspense>
 );
}
