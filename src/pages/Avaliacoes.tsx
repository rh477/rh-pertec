import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export default function Avaliacoes() {
  const { data } = useQuery({
    queryKey: ['avaliacoes'],
    queryFn: async () => {
      const { data } = await supabase.from('avaliacoes').select('*, pessoas(nome, cargo)').order('created_at', { ascending: false })
      return data ?? []
    },
  })

  return (
    <div>
      <div className="bg-white rounded-2xl p-12 shadow-sm text-center text-gray-300 mb-6">
        <div className="text-5xl mb-3">⭐</div>
        <div className="font-bold text-lg text-gray-400">Módulo de Avaliações</div>
        <div className="text-sm mt-1">
          {data?.length === 0 ? 'Nenhuma avaliação cadastrada ainda.' : `${data?.length} avaliação(ões) registrada(s).`}
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-700">
        <strong>Em construção:</strong> Este módulo permitirá criar avaliações 90/180/360° com notas por competência, pontos fortes e áreas de melhoria, vinculadas ao PDI.
      </div>
    </div>
  )
}
