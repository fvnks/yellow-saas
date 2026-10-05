'use client';

import { useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'textarea';
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  value: string;
  onChange: (name: string, value: string) => void;
  onBlur: (name: string) => void;
  disabled?: boolean;
}

export function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  helperText,
  error,
  value,
  onChange,
  onBlur,
  disabled = false,
}: FormFieldProps) {
  const [touched, setTouched] = useState(false);
  const showError = touched && error;

  const handleBlur = useCallback(() => {
    setTouched(true);
    onBlur(name);
  }, [name, onBlur]);

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-xs font-semibold text-ink">
        {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={handleBlur}
          disabled={disabled}
          rows={5}
          className={cn(
            "w-full bg-gray-50 border rounded-md px-4 py-3 text-sm text-ink placeholder-slate-text",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all",
            error
              ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
              : "border-[#E2E8F0] focus:ring-[#0369A1]/20 focus:border-[#0369A1]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${name}-error` : helperText ? `${name}-hint` : undefined}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={handleBlur}
          disabled={disabled}
          className={cn(
            "w-full bg-gray-50 border rounded-md px-4 py-3 text-sm text-ink placeholder-slate-text",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all",
            error
              ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
              : "border-[#E2E8F0] focus:ring-[#0369A1]/20 focus:border-[#0369A1]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${name}-error` : helperText ? `${name}-hint` : undefined}
        />
      )}
      {helperText && !error && (
        <p id={`${name}-hint`} className="text-[11px] text-slate-text">
          {helperText}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} role="alert" className="flex items-center gap-1.5 text-[11px] text-red-600">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

interface ContactFormProps {
  onSubmit: (data: Record<string, string>) => Promise<void>;
  source: string;
  submitLabel?: string;
  submitting?: boolean;
}

export function ContactForm({ onSubmit, source, submitLabel = 'Enviar mensaje', submitting = false }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateField = useCallback((name: string, value: string) => {
    const newErrors = { ...errors };
    switch (name) {
      case 'name':
        if (!value.trim()) newErrors.name = 'El nombre es obligatorio';
        else if (value.trim().length < 2) newErrors.name = 'El nombre debe tener al menos 2 caracteres';
        else delete newErrors.name;
        break;
      case 'email':
        if (!value.trim()) newErrors.email = 'El email es obligatorio';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors.email = 'Formato de email inválido';
        else delete newErrors.email;
        break;
      case 'message':
        if (!value.trim()) newErrors.message = 'El mensaje es obligatorio';
        else if (value.trim().length < 10) newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
        else delete newErrors.message;
        break;
    }
    setErrors(newErrors);
  }, [errors]);

  const handleChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      validateField(name, value);
    }
  }, [errors, validateField]);

  const handleBlur = useCallback((name: string) => {
    validateField(name, formData[name]);
  }, [formData, validateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      if (!formData[key].trim()) {
        newErrors[key] = `${key === 'name' ? 'Nombre' : key === 'email' ? 'Email' : 'Mensaje'} es obligatorio`;
      } else if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[key])) {
        newErrors[key] = 'Formato de email inválido';
      } else if (key === 'message' && formData[key].trim().length < 10) {
        newErrors[key] = 'El mensaje debe tener al menos 10 caracteres';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error?.message || 'No pudimos enviar tu mensaje');
      }
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', message: '', website: '' });
      setErrors({});
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al enviar el mensaje');
    }
  };

  if (submitSuccess) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-ink mb-2">¡Mensaje enviado!</h3>
        <p className="text-sm text-slate-text mb-6">Te responderemos dentro de 24 horas hábiles.</p>
        <button
          onClick={() => { setSubmitSuccess(false); setSubmitError(null); }}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors underline underline-offset-2"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          name="name"
          label="Nombre *"
          type="text"
          required
          autoComplete="name"
          placeholder="Tu nombre"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.name}
          helperText="Tu nombre completo"
          disabled={submitting}
        />
        <FormField
          name="email"
          label="Correo electrónico *"
          type="email"
          required
          autoComplete="email"
          placeholder="tu@empresa.cl"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          helperText="Te responderemos a este email"
          disabled={submitting}
        />
      </div>
      <FormField
        name="message"
        label="Mensaje *"
        type="textarea"
        required
        placeholder="Cuéntanos sobre tu proyecto..."
        value={formData.message}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.message}
        helperText="Mínimo 10 caracteres"
        disabled={submitting}
      />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        value={formData.website}
        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
      />
      {submitError && (
        <p role="alert" className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {submitError}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[160px] text-sm font-semibold transition-colors",
          "active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
          "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
        )}
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <span>{submitLabel}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </>
        )}
      </button>
      <p className="text-[10px] text-slate-text text-center">
        Al enviar aceptas nuestra{' '}
        <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">Política de Privacidad</a>.
      </p>
    </form>
  );
}