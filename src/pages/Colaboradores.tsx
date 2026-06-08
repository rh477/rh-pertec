import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase, DISC_COLORS } from '@/lib/supabase'
import type { Pessoa } from '@/lib/supabase'

export default function Colaboradores() {
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'colaborador' | 'candidato'>('todos')
  const [busca, setBusca] = useState('')

  const { data: pessoas, isLoading } = useQuery({
    queryKey: ['pessoas'],
    queryFn: async () => {
      const { data } = await supabase
        .from('pessoas')
        .select('*, disc_perfis(*)')
        .order('nome')
      return (data ?? []) as Pessoa[]
    },
  })

  const filtradas = pessoas?.filter((p) => {
    const matchTipo = filtroTipo === 'todos' || p.tipo === filtroTipo
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.cargo.toLowerCase().includes(busca.toLowerCase())
    return matchTipo && matchBusca
  }) ?? []

  return (
    <div>
      {/* Filtros */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por nome ou cargo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        {(['todos', 'colaborador', 'candidato'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFiltroTipo(t)}
            className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${filtroTipo === t ? 'bg-brand text-white border-brand' : 'bg-white text-gray-500 border-gray-200 hover:border-brand hover:text-brand'}`}
          >
            {t === 'todos' ? 'Todos' : t === 'colaborador' ? 'Colaboradores' : 'Candidatos'}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Carregando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['Nome', 'Cargo', 'Setor', 'Tipo', 'D', 'I', 'S', 'C', 'Reat.', 'Perfil Dom.'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 bg-gray-50 text-xs font-extrabold uppercase tracking-wide text-gray-400 border-b border-gray-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((p) => {
                const disc = p.disc_perfis?.[0]
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold">{p.nome}</td>
                    <td className="px-4 py-3 text-gray-600">{p.cargo}</td>
                    <td className="px-4 py-3 text-gray-500">{p.setor ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${p.tipo === 'candidato' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {p.tipo === 'candidato' ? 'Candidato' : 'Colaborador'}
                      </span>
                    </td>
                    {disc ? (
                      <>
                        {(['d_mat', 'i_mat', 's_mat', 'c_mat'] as const).map((f, i) => {
                          const color = Object.values(DISC_COLORS)[i]
                          return (
                            <td key={f} className="px-4 py-3 font-bold text-center" style={{ color }}>
                              {disc[f].toFixed(1)}
                            </td>
                          )
                        })}
                        <td className={`px-4 py-3 font-bold text-center ${(disc.reatividade ?? 0) > 20 ? 'text-red-500' : (disc.reatividade ?? 0) > 15 ? 'text-yellow-500' : 'text-green-600'}`}>
                          {disc.reatividade?.toFixed(1) ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-black text-base" style={{ color: disc.perfil_dom ? DISC_COLORS[disc.perfil_dom as keyof typeof DISC_COLORS] : '#888' }}>
                            {disc.perfil_dom ?? '—'}
                          </span>
                        </td>
                      </>
                    ) : (
                      <td colSpan={6} className="px-4 py-3 text-gray-300 text-center text-xs">Sem perfil DISC</td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
