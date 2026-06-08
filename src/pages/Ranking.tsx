import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase, calcFit, scoreStatus, DISC_COLORS } from '@/lib/supabase'
import type { Pessoa, CargoIdeal } from '@/lib/supabase'

export default function Ranking() {
  const [nivelRef, setNivelRef] = useState('JR')

  const { data: pessoas } = useQuery({
    queryKey: ['pessoas'],
    queryFn: async () => {
      const { data } = await supabase.from('pessoas').select('*, disc_perfis(*)')
      return (data ?? []) as Pessoa[]
    },
  })

  const { data: cargos } = useQuery({
    queryKey: ['cargos_ideais'],
    queryFn: async () => {
      const { data } = await supabase.from('cargos_ideais').select('*').order('nivel_ref')
      return (data ?? []) as CargoIdeal[]
    },
  })

  const cargoAtual = cargos?.find((c) => c.nivel_ref === nivelRef)

  const ranking = pessoas
    ?.filter((p) => p.disc_perfis?.length)
    .map((p) => {
      const disc = p.disc_perfis![0]
      const fit = cargoAtual ? calcFit(disc, cargoAtual) : 0
      return { ...p, disc, fit }
    })
    .sort((a, b) => b.fit - a.fit) ?? []

  return (
    <div>
      {/* Tabs de cargo */}
      <div className="flex gap-2 flex-wrap mb-6">
        {cargos?.map((c) => (
          <button
            key={c.nivel_ref}
            onClick={() => setNivelRef(c.nivel_ref)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${nivelRef === c.nivel_ref ? 'bg-sidebar text-white border-sidebar' : 'bg-white text-gray-500 border-gray-200 hover:border-sidebar hover:text-sidebar'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {cargoAtual && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="text-sm font-bold text-gray-500 mb-2">Faixas ideais — {cargoAtual.label}</div>
          <div className="grid grid-cols-4 gap-3">
            {(['D', 'I', 'S', 'C'] as const).map((f) => (
              <div key={f} className="text-center p-3 rounded-xl bg-gray-50 border-t-4" style={{ borderColor: DISC_COLORS[f] }}>
                <div className="text-xl font-black" style={{ color: DISC_COLORS[f] }}>{f}</div>
                <div className="text-sm font-bold mt-1">{cargoAtual[`${f.toLowerCase()}_min` as keyof CargoIdeal]}–{cargoAtual[`${f.toLowerCase()}_max` as keyof CargoIdeal]}%</div>
                <div className="text-xs text-gray-400">Reat. máx {cargoAtual.max_reat}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ranking */}
      <div className="space-y-3">
        {ranking.map((p, i) => {
          const status = scoreStatus(p.fit)
          return (
            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className={`text-3xl font-black w-10 text-center ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-gray-300'}`}>
                {i + 1}
              </div>
              <div className="min-w-[120px]">
                <div className="font-black text-base">{p.nome}</div>
                <div className="text-xs text-gray-400">{p.cargo}</div>
              </div>
              <div className="flex-1 grid grid-cols-4 gap-2">
                {(['d_mat', 'i_mat', 's_mat', 'c_mat'] as const).map((f, idx) => {
                  const color = Object.values(DISC_COLORS)[idx]
                  const key = ['D', 'I', 'S', 'C'][idx]
                  return (
                    <div key={f}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="font-black" style={{ color }}>{key}</span>
                        <span className="text-gray-500">{p.disc[f].toFixed(0)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${p.disc[f]}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="text-center min-w-[70px]">
                <div className="text-3xl font-black text-brand">{p.fit}</div>
                <div className="text-xs text-gray-400">aderência</div>
              </div>
              <div className="min-w-[170px] text-right">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${status.color}`}>
                  {status.icon} {status.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
