import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase, calcFit, scoreStatus, DISC_COLORS, DISC_LABELS } from '@/lib/supabase'
import type { Pessoa, CargoIdeal } from '@/lib/supabase'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, ResponsiveContainer } from 'recharts'

export default function Comparar() {
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
  const comDisc = pessoas?.filter((p) => p.disc_perfis?.length) ?? []

  const radarData = (['D', 'I', 'S', 'C'] as const).map((f) => {
    const row: Record<string, number | string> = {
      factor: DISC_LABELS[f],
      ideal_min: cargoAtual ? cargoAtual[`${f.toLowerCase()}_min` as keyof CargoIdeal] as number : 0,
      ideal_max: cargoAtual ? cargoAtual[`${f.toLowerCase()}_max` as keyof CargoIdeal] as number : 0,
    }
    comDisc.forEach((p) => {
      row[p.nome] = p.disc_perfis![0][`${f.toLowerCase()}_mat` as keyof typeof p.disc_perfis[0]] as number
    })
    return row
  })

  const COLORS = ['#6c63ff', '#e74c3c', '#f39c12', '#27ae60', '#2980b9', '#8e44ad', '#16a085', '#d81b60']

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-6">
        {cargos?.map((c) => (
          <button key={c.nivel_ref} onClick={() => setNivelRef(c.nivel_ref)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${nivelRef === c.nivel_ref ? 'bg-sidebar text-white border-sidebar' : 'bg-white text-gray-500 border-gray-200 hover:border-sidebar'}`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="font-bold text-gray-700 mb-4">Radar — Todos os Perfis vs. Ideal {cargoAtual?.label}</div>
        <ResponsiveContainer width="100%" height={360}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="factor" tick={{ fontSize: 13 }} />
            {comDisc.map((p, i) => (
              <Radar key={p.id} name={p.nome} dataKey={p.nome}
                stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.08} strokeWidth={2} />
            ))}
            <Radar name="Ideal Mín" dataKey="ideal_min" stroke="#6c63ff" fill="none" strokeDasharray="4 4" strokeWidth={1.5} />
            <Radar name="Ideal Máx" dataKey="ideal_max" stroke="#6c63ff" fill="#6c63ff" fillOpacity={0.07} strokeDasharray="4 4" strokeWidth={1.5} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {cargoAtual && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="font-bold text-gray-700 mb-4">Aderência ao cargo — {cargoAtual.label}</div>
          <div className="space-y-3">
            {comDisc
              .map((p) => ({ ...p, fit: calcFit(p.disc_perfis![0], cargoAtual) }))
              .sort((a, b) => b.fit - a.fit)
              .map((p) => {
                const status = scoreStatus(p.fit)
                return (
                  <div key={p.id} className="flex items-center gap-4">
                    <div className="w-28 font-bold text-sm">{p.nome}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${p.fit}%` }} />
                    </div>
                    <div className="w-10 text-right font-black text-brand">{p.fit}%</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${status.color}`}>{status.label}</span>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
