import { useQuery } from '@tanstack/react-query'
import { supabase, DISC_COLORS } from '@/lib/supabase'
import type { CargoIdeal } from '@/lib/supabase'

export default function Cargos() {
  const { data: cargos, isLoading } = useQuery({
    queryKey: ['cargos_ideais'],
    queryFn: async () => {
      const { data } = await supabase.from('cargos_ideais').select('*').order('setor').order('nivel_ref')
      return (data ?? []) as CargoIdeal[]
    },
  })

  const setores = [...new Set(cargos?.map((c) => c.setor ?? 'Outros'))]

  if (isLoading) return <div className="text-gray-400 p-12 text-center">Carregando...</div>

  return (
    <div>
      {setores.map((setor) => (
        <div key={setor} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gradient-to-r from-brand to-transparent" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand px-2">{setor}</span>
            <div className="flex-1 h-px bg-gradient-to-l from-brand to-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-5">
            {cargos?.filter((c) => (c.setor ?? 'Outros') === setor).map((cargo) => (
              <div key={cargo.id} className="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-brand">
                <div className="font-black text-lg mb-0.5">{cargo.label}</div>
                <div className="text-sm text-gray-400 mb-4">{cargo.descricao}</div>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {(['D', 'I', 'S', 'C'] as const).map((f) => (
                    <div key={f} className="text-center bg-gray-50 rounded-xl p-3 border-t-2" style={{ borderColor: DISC_COLORS[f] }}>
                      <div className="text-lg font-black" style={{ color: DISC_COLORS[f] }}>{f}</div>
                      <div className="text-sm font-bold mt-0.5">
                        {cargo[`${f.toLowerCase()}_min` as keyof CargoIdeal]}–{cargo[`${f.toLowerCase()}_max` as keyof CargoIdeal]}%
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap text-xs">
                  <span className="bg-red-50 text-red-600 font-bold px-2.5 py-1 rounded-full">Reat. máx {cargo.max_reat}%</span>
                  <span className="bg-gray-100 text-gray-600 font-bold px-2.5 py-1 rounded-full">
                    Pesos: D{Math.round(cargo.peso_d * 100)} I{Math.round(cargo.peso_i * 100)} S{Math.round(cargo.peso_s * 100)} C{Math.round(cargo.peso_c * 100)}
                  </span>
                </div>
                {cargo.peso_desc && <div className="mt-3 text-xs text-gray-500 italic">{cargo.peso_desc}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
