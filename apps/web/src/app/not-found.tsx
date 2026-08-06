export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">404</h1>
        <p className="text-slate-500 mt-2">Página no encontrada</p>
        <a href="/dashboard" className="text-indigo-600 hover:underline mt-4 inline-block">
          Volver al dashboard
        </a>
      </div>
    </div>
  );
}
