import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export default function ENPS() {
  const { data: respostas } = useQuery({
    queryKey: ['enps'],
    queryFn: async () => {
      const { data } = await supabase.from('enps').select('*').order('created_at', { ascending: false })
      return data ?? []
    },
  })

  const promotores = respostas?.filter((r) => r.nota >= 9).length ?? 0
  const detratores = respostas?.filter((r) => r.nota <= 6).length ?? 0
  const total = respostas?.length ?? 0
  const enps = total > 0 ? Math.round(((promotores - detratores) / total) * 100) : null

  return (
    <div>
      {total > 0 ? (
        <div className="grid grid-cols-4 gap-5 mb-6">
          {[
            { label: 'eNPS Score', value: enps !== null ? `${enps}` : '—', color: 'border-brand text-brand' },
            { label: 'Promotores', value: promotores, color: 'border-green-500 text-green-600' },
            { label: 'Neutros', value: total - promotores - detratores, color: 'border-yellow-500 text-yellow-600' },
            { label: 'Detratores', value: detratores, color: 'border-red-400 text-red-500' },
          ].map((k) => (
            <div key={k.label} className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${k.color.split(' ')[0]}`}>
              <div className="text-xs font-extrabold uppercase tracking-wide text-gray-400">{k.label}</div>
              <div className={`text-4xl font-black mt-2 ${k.color.split(' ')[1]}`}>{k.value}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 shadow-sm text-center text-gray-300 mb-6">
          <div className="text-5xl mb-3">💜</div>
          <div className="font-bold text-lg text-gray-400">eNPS</div>
          <div className="text-sm mt-1">Nenhuma resposta registrada ainda.</div>
        </div>
      )}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-700">
        <strong>Em construção:</strong> Este módulo permitirá coletar respostas de eNPS de forma anônima, com análise de promotores, neutros e detratores e evolução histórica.
      </div>
    </div>
  )
}
