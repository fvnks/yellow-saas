'use client';

import { useState, useEffect } from 'react';
import { Vote, Plus, Users, ShieldCheck, CheckCircle2, AlertCircle, FileText, BarChart3, Scale } from 'lucide-react';

interface AssemblyTopicResult {
  option: string;
  alicuotaPct: number;
  count: number;
}

interface AssemblyTopic {
  id: string;
  title: string;
  description: string;
  isVoting: boolean;
  results: AssemblyTopicResult[];
}

interface Assembly {
  id: string;
  title: string;
  assemblyDate: string;
  assemblyType: string;
  quorumRequiredPct: number;
  status: string;
  topics: AssemblyTopic[];
}

export default function AsambleasPage() {
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAssemblyModal, setShowAddAssemblyModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<AssemblyTopic | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [assemblyType, setAssemblyType] = useState('ordinary');
  const [quorumPct, setQuorumPct] = useState('50.0');

  // Voting state
  const [unitId, setUnitId] = useState('');
  const [voteOption, setVoteOption] = useState('A favor');
  const [units, setUnits] = useState<any[]>([]);

  const fetchAssemblies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/condominio/assemblies');
      const json = await res.json();
      if (json.success) {
        setAssemblies(json.data || []);
      }
      const uRes = await fetch('/api/condominio');
      const uJson = await uRes.json();
      if (uJson.success && uJson.data.units) {
        setUnits(uJson.data.units);
        if (uJson.data.units.length > 0) setUnitId(uJson.data.units[0].id);
      }
    } catch (err) {
      console.error('Error fetching assemblies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssemblies();
  }, []);

  const handleCreateAssembly = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/condominio/assemblies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          assembly_type: assemblyType,
          quorum_required_pct: parseFloat(quorumPct) || 50.0
        })
      });
      const json = await res.json();
      if (json.success) {
        await fetchAssemblies();
        setShowAddAssemblyModal(false);
        setTitle('');
      } else {
        alert(json.error || 'Error al crear asamblea');
      }
    } catch (err) {
      console.error('Error creating assembly:', err);
    }
  };

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic || !unitId) return;

    try {
      const res = await fetch('/api/condominio/assemblies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'vote',
          topic_id: selectedTopic.id,
          unit_id: unitId,
          vote_option: voteOption
        })
      });
      const json = await res.json();
      if (json.success) {
        await fetchAssemblies();
        setShowVoteModal(false);
      } else {
        alert(json.error || 'Error al emitir voto');
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Asambleas & Votaciones Digitales (Ley 21.442)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
              Voto Ponderado por Alícuota
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Convocatoria de asambleas ordinarias y extraordinarias, control de quórum legal y votaciones según % de copropiedad.
          </p>
        </div>

        <button
          onClick={() => setShowAddAssemblyModal(true)}
          className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nueva Asamblea
        </button>
      </div>

      {/* Assembly List */}
      {assemblies.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center">
          <Vote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No hay asambleas registradas</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Crea la primera asamblea para convocar a copropietarios y someter a votación proyectos o aprobación de cuentas.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {assemblies.map((a) => (
            <div key={a.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {a.assemblyType === 'extraordinary' ? 'Extraordinaria' : 'Ordinaria'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quórum Requerido: <span className="font-semibold text-slate-700">{a.quorumRequiredPct}% alícuota</span>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start">
                  {a.status === 'scheduled' ? 'Programada' : 'Finalizada'}
                </span>
              </div>

              {/* Topics & Voting */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tabla & Temas a Votar</h4>
                {a.topics.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hay temas agregados aún.</p>
                ) : (
                  a.topics.map((topic) => (
                    <div key={topic.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h5 className="text-sm font-bold text-slate-900">{topic.title}</h5>
                        {topic.description && <p className="text-xs text-slate-500">{topic.description}</p>}
                        
                        {/* Vote breakdown */}
                        <div className="flex items-center gap-4 mt-2">
                          {topic.results.map((r) => (
                            <div key={r.option} className="text-xs">
                              <span className="font-semibold text-slate-700">{r.option}: </span>
                              <span className="font-bold text-slate-900">{r.alicuotaPct.toFixed(2)}% alícuota</span> ({r.count} votos)
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedTopic(topic);
                          setShowVoteModal(true);
                        }}
                        className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-center shrink-0"
                      >
                        <Scale className="w-3.5 h-3.5 text-yellow-400" />
                        Emitir Voto
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Assembly Modal */}
      {showAddAssemblyModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Nueva Convocatoria de Asamblea</h3>
            <form onSubmit={handleCreateAssembly} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título de la Asamblea</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Asamblea Ordinaria de Copropietarios 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Asamblea</label>
                  <select
                    value={assemblyType}
                    onChange={(e) => setAssemblyType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    <option value="ordinary">Ordinaria</option>
                    <option value="extraordinary">Extraordinaria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quórum Requerido (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={quorumPct}
                    onChange={(e) => setQuorumPct(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAssemblyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs"
                >
                  Crear Asamblea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vote Modal */}
      {showVoteModal && selectedTopic && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Emitir Voto Ley 21.442</h3>
            <p className="text-xs text-slate-500">Tema: <span className="font-semibold text-slate-800">{selectedTopic.title}</span></p>

            <form onSubmit={handleVote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Seleccionar Unidad / Copropietario</label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      Unidad {u.number} - {u.ownerName} ({u.alicuotaPercentage}% alícuota)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Opción de Voto</label>
                <select
                  value={voteOption}
                  onChange={(e) => setVoteOption(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  <option value="A favor">A favor</option>
                  <option value="En contra">En contra</option>
                  <option value="Abstención">Abstención</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVoteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-4 py-2 rounded-xl text-xs"
                >
                  Registrar Voto Ponderado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
