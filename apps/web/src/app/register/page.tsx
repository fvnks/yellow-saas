'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button, Input } from '@yellow-erp/ui';
import AuthPanel from '@/components/auth/AuthPanel';

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
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">¡Cuenta creada!</h1>
          <p className="text-muted-foreground mt-3">
            Tu cuenta fue creada exitosamente. Ahora puedes iniciar sesión con tu correo y contraseña.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-8 w-full rounded-lg bg-primary hover:bg-primary/90 text-white px-4 py-3 text-sm font-medium transition-all duration-150 active:scale-[0.98]"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-card font-sans text-foreground antialiased lg:flex-row">
      {/* Left Image Panel */}
      <AuthPanel />

      {/* Right Form Panel */}
      <div className="flex w-full flex-col items-center justify-center p-6 sm:p-12 lg:w-1/2">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center border border-border">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">Yellow ERP</span>
        </div>

        <div className="w-full max-w-[440px]">
          {/* Title */}
          <div className="mb-8">
            <h1 className="mb-3 text-[36px] font-bold leading-[1.05] tracking-tight text-foreground">
              Crea tu cuenta
            </h1>
            <p className="text-[15px] text-muted-foreground text-balance">
              Comienza tu prueba gratuita de 14 días. Sin tarjeta de crédito.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm" role="alert">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="relative sm:col-span-2">
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
                  className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative sm:col-span-2">
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
                  className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg border border-border">
              <p className="text-sm text-foreground font-medium mb-2">La contraseña debe incluir:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Al menos 8 caracteres</li>
                <li>• Una letra mayúscula y una minúscula</li>
                <li>• Al menos un número</li>
                <li>• Al menos un carácter especial (@$!%*?&)</li>
              </ul>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 text-blue-600 border-border rounded focus:ring-blue-600 mt-0.5"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-foreground">
                Acepto los{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                  Términos de Servicio
                </a>
                {' '}y la{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                  Política de Privacidad
                </a>
              </label>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Crear Cuenta Gratuita
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-[14px] text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted flex items-center justify-center"><p className="text-muted-foreground">Cargando...</p></div>}>
      <RegisterForm />
    </Suspense>
  );
}
