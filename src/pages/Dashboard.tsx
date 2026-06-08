import { useQuery } from '@tanstack/react-query'
import { supabase, calcFit, DISC_COLORS } from '@/lib/supabase'
import type { Pessoa, CargoIdeal } from '@/lib/supabase'

export default function Dashboard() {
  const { data: pessoas } = useQuery({
    queryKey: ['pessoas'],
    queryFn: async () => {
      const { data } = await supabase
        .from('pessoas')
        .select('*, disc_perfis(*)')
        .eq('status', 'ativo')
        .order('nome')
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

  const colaboradores = pessoas?.filter((p) => p.tipo === 'colaborador') ?? []
  const candidatos = pessoas?.filter((p) => p.tipo === 'candidato') ?? []

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        {[
          { label: 'Colaboradores', value: colaboradores.length, color: 'border-brand', text: 'text-brand' },
          { label: 'Candidatos', value: candidatos.length, color: 'border-green-500', text: 'text-green-600' },
          { label: 'Perfis DISC', value: pessoas?.filter(p => p.disc_perfis?.length).length ?? 0, color: 'border-yellow-500', text: 'text-yellow-600' },
          { label: 'Cargos Mapeados', value: cargos?.length ?? 0, color: 'border-red-400', text: 'text-red-500' },
        ].map((k) => (
          <div key={k.label} className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${k.color}`}>
            <div className="text-xs font-extrabold uppercase tracking-wide text-gray-400">{k.label}</div>
            <div className={`text-4xl font-black mt-2 ${k.text}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Cards de perfil */}
      <div className="mb-6">
        <div className="text-base font-bold text-gray-700 mb-4">Perfis DISC — Visão Geral</div>
        <div className="grid grid-cols-2 gap-5">
          {pessoas?.filter((p) => p.disc_perfis?.length).map((pessoa) => {
            const disc = pessoa.disc_perfis![0]
            const cargo = cargos?.find((c) => c.nivel_ref === pessoa.nivel_ref)
            const fit = cargo ? calcFit(disc, cargo) : null
            const fatores = [
              { k: 'D', v: disc.d_mat, c: DISC_COLORS.D },
              { k: 'I', v: disc.i_mat, c: DISC_COLORS.I },
              { k: 'S', v: disc.s_mat, c: DISC_COLORS.S },
              { k: 'C', v: disc.c_mat, c: DISC_COLORS.C },
            ]
            return (
              <div key={pessoa.id} className="bg-white rounded-2xl p-5 shadow-sm border-t-4"
                style={{ borderColor: disc.perfil_dom ? DISC_COLORS[disc.perfil_dom as keyof typeof DISC_COLORS] : '#6c63ff' }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-black text-base">{pessoa.nome}</div>
                    <div className="text-xs text-gray-400">{pessoa.cargo}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${pessoa.tipo === 'candidato' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {pessoa.tipo === 'candidato' ? 'Candidato' : 'Colaborador'}
                    </span>
                    {fit !== null && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${fit >= 85 ? 'bg-green-100 text-green-700' : fit >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                        {fit}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {fatores.map(({ k, v, c }) => (
                    <div key={k} className="text-center">
                      <div className="text-xs font-black" style={{ color: c }}>{k}</div>
                      <div className="text-lg font-black" style={{ color: c }}>{v.toFixed(0)}</div>
                      <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${v}%`, backgroundColor: c }} />
                      </div>
                    </div>
                  ))}
                </div>
                {disc.reatividade !== null && (
                  <div className={`mt-3 text-xs font-bold px-2 py-0.5 rounded-full inline-block ${disc.reatividade > 20 ? 'bg-red-100 text-red-600' : disc.reatividade > 15 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-700'}`}>
                    Reatividade: {disc.reatividade.toFixed(1)}%
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
