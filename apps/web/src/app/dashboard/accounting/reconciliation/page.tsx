'use client';

import { useEffect, useState } from "react";
import { getApiClient } from "@/lib/api-client";
import type { BankAccount, BankStatementLine, ReconciliationMatch, ReconciliationSession } from "./types";
import { ArrowUpDown, CheckCircle, XCircle, AlertCircle, Plus, RefreshCw, Loader2, TrendingUp } from "lucide-react";

const clpFormatter = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
const CLP = (val: number) => clpFormatter.format(val);

export default function ReconciliationPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [period, setPeriod] = useState<string>("2026-08");
  const [statementLines, setStatementLines] = useState<BankStatementLine[]>([]);
  const [sessions, setSessions] = useState<ReconciliationSession[]>([]);
  const [activeSession, setActiveSession] = useState<ReconciliationSession | null>(null);
  const [matches, setMatches] = useState<ReconciliationMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAccounts();
    loadSessions();
  }, []);

  const loadAccounts = async () => {
    try {
      const client = getApiClient();
      const res: any = await client.getAccounts({ type: "bank", status: "active" });
      const accountList = Array.isArray(res) ? res : (res?.data || []);
      setAccounts(accountList);
      if (accountList.length > 0 && !selectedAccount) setSelectedAccount(accountList[0].id);
    } catch (e) {
      console.error("Failed to load accounts", e);
    }
  };

  const loadSessions = async () => {
    try {
      const client = getApiClient();
      const data: any = await client.getReconciliationSessions();
      setSessions(Array.isArray(data) ? data : (data?.data || []));
    } catch (e) {
      console.error("Failed to load sessions", e);
    }
  };

  const loadStatement = async () => {
    if (!selectedAccount) return;
    setLoading(true);
    try {
      const client = getApiClient();
      const data = await client.getBankStatementLines(selectedAccount, { period });
      setStatementLines(data);
      const open = data.filter((l: BankStatementLine) => l.matchStatus !== "matched" && l.matchStatus !== "auto_matched");
      setMatches(open.map((l: BankStatementLine) => ({
        id: `match_${l.id}`,
        statementLineId: l.id,
        entryId: '',
        matchAmountCLP: l.amountCLP,
        differenceCLP: 0,
        matchedAt: new Date().toISOString(),
        matchedBy: 'System',
        matchType: 'full' as const
      })));
    } catch (e) {
      console.error("Failed to load statement", e);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!selectedAccount) return;
    setRefreshing(true);
    try {
      const client = getApiClient();
      const session: any = await client.createReconciliationSession(selectedAccount, period);
      setActiveSession(session);
      await loadSessions();
    } catch (e) {
      console.error("Failed to create session", e);
    } finally {
      setRefreshing(false);
    }
  };

  const autoMatch = async () => {
    if (!activeSession?.id) return;
    setRefreshing(true);
    try {
      const client = getApiClient();
      const result: any = await client.autoMatch(activeSession.id);
      const updatedLines = statementLines.map(line => {
        const match = result.matches?.find((m: { statement_line_id: string }) => m.statement_line_id === line.id);
        if (match) return { ...line, matchStatus: "matched" as const };
        return line;
      });
      setStatementLines(updatedLines);
      setMatches(result.matches || []);
    } catch (e) {
      console.error("Auto-match failed", e);
    } finally {
      setRefreshing(false);
    }
  };

  const manualMatch = async (statementLineId: string, journalEntryId: string) => {
    if (!activeSession?.id) return;
    try {
      const client = getApiClient();
      const match: any = await client.manualMatch(activeSession.id, statementLineId, journalEntryId);
      setMatches(prev => [...prev, match]);
      setStatementLines(prev => prev.map(l => l.id === statementLineId ? { ...l, matchStatus: "matched" as const } : l));
    } catch (e) {
      console.error("Manual match failed", e);
    }
  };

  const completeSession = async () => {
    if (!activeSession?.id) return;
    try {
      const client = getApiClient();
      const result = await client.completeSession(activeSession.id);
      setActiveSession(null);
      await loadSessions();
      await loadStatement();
    } catch (e) {
      console.error("Complete session failed", e);
    }
  };

  const cancelSession = async () => {
    if (!activeSession?.id) return;
    try {
      const client = getApiClient();
      await client.cancelSession(activeSession.id);
      setActiveSession(null);
      await loadSessions();
    } catch (e) {
      console.error("Cancel session failed", e);
    }
  };

  const [syncingFintoc, setSyncingFintoc] = useState(false);

  const syncFintoc = async () => {
    if (!selectedAccount) return;
    setSyncingFintoc(true);
    try {
      const res = await fetch('/api/banking/fintoc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_transactions', account_id: selectedAccount })
      });
      const json = await res.json();
      if (json.success) {
        await loadStatement();
      }
    } catch (e) {
      console.error("Fintoc sync error", e);
    } finally {
      setSyncingFintoc(false);
    }
  };

  const matchedCount = statementLines.filter(l => l.matchStatus === "matched" || l.matchStatus === "auto_matched").length;
  const totalStatement = statementLines.reduce((sum, l) => sum + l.amountCLP, 0);
  const totalBooked = statementLines.filter(l => l.matchStatus === "matched" || l.matchStatus === "auto_matched").reduce((sum, l) => sum + l.amountCLP, 0);
  const variance = totalStatement - totalBooked;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Conciliación Bancaria</h1>
        <p className="text-slate-500 mt-1">Compara los movimientos del estado de cuenta con tus registros contables</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Estado Cuenta</p>
              <p className="text-lg font-bold text-slate-900">{CLP(totalStatement)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Conciliado</p>
              <p className="text-lg font-bold text-slate-900">{matchedCount} items</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Pendiente</p>
              <p className="text-lg font-bold text-slate-900">{statementLines.length - matchedCount} items</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${variance === 0 ? "bg-emerald-50" : "bg-amber-50"}`}>
              <AlertCircle className={`w-5 h-5 ${variance === 0 ? "text-emerald-600" : "text-amber-600"}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Diferencia</p>
              <p className={`text-lg font-bold ${variance === 0 ? "text-emerald-600" : "text-rose-600"}`}>{CLP(variance)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Configurar Conciliación</h3>
          <div className="flex gap-2">
            <button
              onClick={syncFintoc}
              disabled={syncingFintoc || !selectedAccount}
              className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncingFintoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Sincronizar Fintoc Bank
            </button>
            <button
              onClick={loadStatement}
              disabled={loading || !selectedAccount}
              className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Cargar Estado
            </button>
            {!activeSession ? (
              <button
                onClick={createSession}
                disabled={!selectedAccount || refreshing}
                className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Nueva Sesión
              </button>
            ) : (
              <button
                onClick={autoMatch}
                disabled={refreshing || matches.length > 0}
                className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpDown className="w-4 h-4" />}
                Auto-Conciliar
              </button>
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cuenta Bancaria</label>
              <select
                value={selectedAccount}
                onChange={e => setSelectedAccount(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent"
              >
                <option value="">Seleccionar cuenta...</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({acc.accountNumber})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Período</label>
              <input
                type="month"
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              {activeSession && (
                <div className="flex gap-2 w-full">
                  <button
                    onClick={completeSession}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Completar
                  </button>
                  <button
                    onClick={cancelSession}
                    className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
          {activeSession && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Sesión activa: {activeSession.statementPeriod}</span>
                <span className="text-xs text-amber-600 ml-auto">{matchedCount}/{statementLines.length} conciliados</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80">
          <h3 className="text-sm font-bold text-slate-900">Líneas del Estado de Cuenta</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Descripción</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">Monto</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500">Asiento</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {statementLines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                        Cargando estado de cuenta...
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 text-slate-300" />
                        <p className="text-sm">No hay líneas para mostrar</p>
                        <p className="text-xs text-slate-400">Selecciona una cuenta y período, luego carga el estado</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : statementLines.map((line) => (
                <tr key={line.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-900">{new Date(line.transactionDate).toLocaleDateString("es-CL")}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{line.description}</td>
                  <td className={`px-6 py-4 text-sm font-medium text-right ${line.amountCLP >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {CLP(Math.abs(line.amountCLP))} {line.amountCLP >= 0 ? "↓" : "↑"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {(line.matchStatus === "matched" || line.matchStatus === "auto_matched") ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Conciliado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-slate-500">
                    {line.matchedEntryId ? (
                      <span className="text-blue-600 font-medium">#{line.matchedEntryId.slice(0, 8)}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                    {(line.matchStatus === "matched" || line.matchStatus === "auto_matched") ? (
                      <span className="text-emerald-600">{CLP(0)}</span>
                    ) : (
                      <span className="text-rose-600">{CLP(line.amountCLP)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            {statementLines.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50/80 border-t-2 border-slate-200">
                  <td className="px-6 py-4 text-sm font-bold text-slate-900" colSpan={2}>Totales</td>
                  <td className="px-6 py-4 text-sm font-bold text-right text-slate-900">{CLP(totalStatement)}</td>
                  <td className="px-6 py-4 text-center"></td>
                  <td className="px-6 py-4 text-center"></td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${variance === 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {CLP(variance)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80">
          <h3 className="text-sm font-bold text-slate-900">Sesiones de Conciliación</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Período</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Cuenta</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500">Conciliados</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">Diferencia</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <p className="text-sm">No hay sesiones de conciliación</p>
                      <p className="text-xs text-slate-400">Crea una nueva sesión para comenzar</p>
                    </div>
                  </td>
                </tr>
              ) : sessions.map((session) => {
                const account = accounts.find(a => a.id === session.accountId);
                return (
                  <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{session.statementPeriod}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{account?.name || session.accountId.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-600">{session.matches.length} items</td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">{CLP(session.differencesCLP || 0)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                        session.status === "reconciled" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        session.status === "in_progress" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {session.status === "reconciled" ? "Conciliada" :
                         session.status === "in_progress" ? "En progreso" : "Cancelada"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
