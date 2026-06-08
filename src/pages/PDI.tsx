import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Pessoa } from '@/lib/supabase'

type PDIItem = {
  id: string; pessoa_id: string; titulo: string; descricao: string | null
  competencia: string | null; meta: string | null; prazo: string | null
  status: string; progresso: number; responsavel: string | null
  pessoas?: { nome: string; cargo: string }
}

export default function PDI() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ pessoa_id: '', titulo: '', descricao: '', meta: '', prazo: '', responsavel: '' })

  const { data: pdis } = useQuery({
    queryKey: ['pdi'],
    queryFn: async () => {
      const { data } = await supabase.from('pdi').select('*, pessoas(nome, cargo)').order('created_at', { ascending: false })
      return (data ?? []) as PDIItem[]
    },
  })

  const { data: pessoas } = useQuery({
    queryKey: ['pessoas_lista'],
    queryFn: async () => {
      const { data } = await supabase.from('pessoas').select('id, nome, cargo').order('nome')
      return (data ?? []) as Pick<Pessoa, 'id' | 'nome' | 'cargo'>[]
    },
  })

  const add = useMutation({
    mutationFn: async () => {
      await supabase.from('pdi').insert({ ...form, progresso: 0, status: 'em_andamento' })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pdi'] }); setShowForm(false); setForm({ pessoa_id: '', titulo: '', descricao: '', meta: '', prazo: '', responsavel: '' }) },
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await supabase.from('pdi').update({ status }).eq('id', id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pdi'] }),
  })

  const STATUS_COLORS: Record<string, string> = {
    em_andamento: 'bg-blue-100 text-blue-700',
    concluido: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-600',
    pausado: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-400">{pdis?.length ?? 0} planos cadastrados</div>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors">
          + Novo PDI
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="font-bold text-gray-700 mb-4">Novo Plano de Desenvolvimento</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 block mb-1">Pessoa</label>
              <select value={form.pessoa_id} onChange={(e) => setForm((v) => ({ ...v, pessoa_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30">
                <option value="">Selecione...</option>
                {pessoas?.map((p) => <option key={p.id} value={p.id}>{p.nome} — {p.cargo}</option>)}
              </select>
            </div>
            {[
              { key: 'titulo', label: 'Título', col: 2 },
              { key: 'meta', label: 'Meta', col: 2 },
              { key: 'descricao', label: 'Descrição', col: 2 },
              { key: 'responsavel', label: 'Responsável', col: 1 },
              { key: 'prazo', label: 'Prazo', col: 1, type: 'date' },
            ].map(({ key, label, col, type }) => (
              <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                <label className="text-xs font-semibold text-gray-500 block mb-1">{label}</label>
                <input type={type ?? 'text'} value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm((v) => ({ ...v, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => add.mutate()} disabled={!form.pessoa_id || !form.titulo}
              className="bg-brand text-white px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-brand-dark">
              Salvar
            </button>
            <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-200">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {pdis?.map((pdi) => (
          <div key={pdi.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-base">{pdi.titulo}</div>
                <div className="text-xs text-gray-400 mt-0.5">{pdi.pessoas?.nome} · {pdi.pessoas?.cargo}</div>
              </div>
              <select value={pdi.status} onChange={(e) => updateStatus.mutate({ id: pdi.id, status: e.target.value })}
                className={`text-xs font-bold px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[pdi.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {['em_andamento', 'concluido', 'pausado', 'cancelado'].map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            {pdi.meta && <div className="mt-2 text-sm text-gray-600">🎯 {pdi.meta}</div>}
            {pdi.prazo && <div className="mt-1 text-xs text-gray-400">📅 Prazo: {new Date(pdi.prazo).toLocaleDateString('pt-BR')}</div>}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progresso</span><span>{pdi.progresso}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pdi.progresso}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
