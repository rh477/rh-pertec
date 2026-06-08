import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export default function Clima() {
  const { data: pesquisas } = useQuery({
    queryKey: ['clima_pesquisas'],
    queryFn: async () => {
      const { data } = await supabase.from('clima_pesquisas').select('*').order('created_at', { ascending: false })
      return data ?? []
    },
  })

  return (
    <div>
      <div className="bg-white rounded-2xl p-12 shadow-sm text-center text-gray-300 mb-6">
        <div className="text-5xl mb-3">🌡️</div>
        <div className="font-bold text-lg text-gray-400">Pesquisa de Clima</div>
        <div className="text-sm mt-1">
          {pesquisas?.length === 0 ? 'Nenhuma pesquisa cadastrada ainda.' : `${pesquisas?.length} pesquisa(s) registrada(s).`}
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-700">
        <strong>Em construção:</strong> Este módulo permitirá criar pesquisas de clima organizacional com dimensões configuráveis (liderança, comunicação, benefícios, crescimento) e dashboard de resultados.
      </div>
    </div>
  )
}
