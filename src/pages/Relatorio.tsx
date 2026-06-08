import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase, calcFit, calcFactorScore, scoreStatus, DISC_COLORS, DISC_LABELS } from '@/lib/supabase'
import type { Pessoa, CargoIdeal } from '@/lib/supabase'

export default function Relatorio() {
  const [pessoaId, setPessoaId] = useState('')

  const { data: pessoas } = useQuery({
    queryKey: ['pessoas'],
    queryFn: async () => {
      const { data } = await supabase.from('pessoas').select('*, disc_perfis(*)').order('nome')
      return (data ?? []) as Pessoa[]
    },
  })

  const { data: cargos } = useQuery({
    queryKey: ['cargos_ideais'],
    queryFn: async () => {
      const { data } = await supabase.from('cargos_ideais').select('*')
      return (data ?? []) as CargoIdeal[]
    },
  })

  const pessoa = pessoas?.find((p) => p.id === pessoaId)
  const disc = pessoa?.disc_perfis?.[0]
  const cargo = cargos?.find((c) => c.nivel_ref === pessoa?.nivel_ref)
  const fit = disc && cargo ? calcFit(disc, cargo) : null
  const status = fit !== null ? scoreStatus(fit) : null

  return (
    <div>
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <select value={pessoaId} onChange={(e) => setPessoaId(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30">
          <option value="">— Selecione uma pessoa para ver o relatório —</option>
          {pessoas?.filter((p) => p.disc_perfis?.length).map((p) => (
            <option key={p.id} value={p.id}>{p.nome} — {p.cargo}</option>
          ))}
        </select>
      </div>

      {pessoa && disc ? (
        <>
          {/* Header */}
          <div className="rounded-2xl p-6 mb-6 text-white flex items-center gap-5"
            style={{ background: `linear-gradient(135deg, ${disc.perfil_dom ? DISC_COLORS[disc.perfil_dom as keyof typeof DISC_COLORS] : '#6c63ff'}, #1a1a2e)` }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black bg-white/20">
              {pessoa.nome[0]}
            </div>
            <div className="flex-1">
              <div className="text-2xl font-black">{pessoa.nome}</div>
              <div className="text-sm opacity-80">{pessoa.cargo} · {pessoa.setor}</div>
              <div className="mt-2 flex gap-2 flex-wrap">
                <span className="bg-white/20 px-3 py-0.5 rounded-full text-xs font-bold">
                  Perfil {disc.perfil_dom} dominante
                </span>
                <span className="bg-white/20 px-3 py-0.5 rounded-full text-xs font-bold">
                  {pessoa.tipo === 'candidato' ? 'Candidato' : 'Colaborador'}
                </span>
                {fit !== null && (
                  <span className="bg-white/20 px-3 py-0.5 rounded-full text-xs font-bold">
                    Aderência {fit}%
                  </span>
                )}
              </div>
            </div>
            {status && (
              <span className={`px-4 py-2 rounded-xl text-sm font-bold ${status.color}`}>
                {status.icon} {status.label}
              </span>
            )}
          </div>

          {/* Fatores DISC */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {(['D', 'I', 'S', 'C'] as const).map((f) => {
              const color = DISC_COLORS[f]
              const mat = disc[`${f.toLowerCase()}_mat` as keyof typeof disc] as number
              const intv = disc[`${f.toLowerCase()}_int` as keyof typeof disc] as number ?? mat
              const reat = intv - mat
              const idealScore = cargo ? calcFactorScore(mat, cargo[`${f.toLowerCase()}_min` as keyof CargoIdeal] as number, cargo[`${f.toLowerCase()}_max` as keyof CargoIdeal] as number) : null
              return (
                <div key={f} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="text-center mb-3">
                    <div className="text-3xl font-black" style={{ color }}>{f}</div>
                    <div className="text-xs text-gray-400">{DISC_LABELS[f]}</div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Maturidade', val: mat },
                      { label: 'Intensidade', val: intv },
                      { label: 'Reatividade', val: Math.abs(reat) },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-gray-500">{label}</span>
                          <span className="font-bold">{val.toFixed(1)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${val}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {idealScore !== null && (
                    <div className={`mt-3 text-center text-xs font-bold px-2 py-1 rounded-lg ${idealScore >= 85 ? 'bg-green-100 text-green-700' : idealScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                      Score no cargo: {Math.round(idealScore)}%
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Nota */}
          {pessoa.nota && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="font-bold text-gray-700 mb-2">Observações</div>
              <div className="text-sm text-gray-600 leading-relaxed">{pessoa.nota}</div>
            </div>
          )}
        </>
      ) : pessoaId ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm text-center text-gray-300">
          <div className="text-5xl mb-3">📋</div>
          <div className="font-bold">Esta pessoa não tem perfil DISC cadastrado</div>
        </div>
      ) : null}
    </div>
  )
}
