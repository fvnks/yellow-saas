'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Phone } from 'lucide-react';
import { Button, Input, Card, CardContent } from '@yellow-erp/ui';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el registro');
      }

      router.push('/login?registered=true');
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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Yellow ERP</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Crear Cuenta</h1>
          <p className="text-slate-500 mt-2">Comienza tu prueba gratuita de 14 días</p>
        </div>

        <Card>
          <CardContent className="p-8">
            {error && (
              <div className="mb-6 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm" role="alert">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre de la Empresa"
                  type="text"
                  value={formData.companyName}
                  onChange={handleInputChange('companyName')}
                  placeholder="Acme SpA"
                  required
                  error={fieldErrors.companyName}
                />

                <Input
                  label="Nombre Completo"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange('fullName')}
                  placeholder="Juan Pérez"
                  required
                  error={fieldErrors.fullName}
                />

                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder="tu@empresa.cl"
                  required
                  error={fieldErrors.email}
                />

                <Input
                  label="Teléfono (opcional)"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  placeholder="+56 2 1234 5678"
                />

                <div className="relative md:col-span-2">
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
                    className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative md:col-span-2">
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
                    className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 font-medium mb-2">La contraseña debe incluir:</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Al menos 8 caracteres</li>
                  <li>• Una letra mayúscula y una minúscula</li>
                  <li>• Al menos un número</li>
                  <li>• Al menos un carácter especial (@$!%*?&)</li>
                </ul>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-slate-700">
                  Acepto los{' '}
                  <a href="/terms" className="text-indigo-600 hover:text-indigo-500 font-medium">
                    Términos de Servicio
                  </a>
                  {' '}y la{' '}
                  <a href="/privacy" className="text-indigo-600 hover:text-indigo-500 font-medium">
                    Política de Privacidad
                  </a>
                </label>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Crear Cuenta Gratuita
              </Button>
            </form>

            <div className="mt-8 p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 text-center mb-2">Planeas iniciar sesión?</p>
              <p className="text-sm text-slate-500 text-center">
                Si ya tienes una cuenta, puedes{' '}
                <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-500">Cargando...</p></div>}>
      <RegisterForm />
    </Suspense>
  );
}