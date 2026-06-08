import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase, DISC_COLORS } from '@/lib/supabase'
import type { Pessoa } from '@/lib/supabase'

type ExtractedDisc = {
  provider: string | null
  dominantProfile: 'D' | 'I' | 'S' | 'C'
  factors: {
    D: { intensity: number; maturity: number; reactivity: number }
    I: { intensity: number; maturity: number; reactivity: number }
    S: { intensity: number; maturity: number; reactivity: number }
    C: { intensity: number; maturity: number; reactivity: number }
  }
  confidence: number
  notes: string
}

export default function AnaliseDisc() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ExtractedDisc | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pessoaId, setPessoaId] = useState('')
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: pessoas } = useQuery({
    queryKey: ['pessoas'],
    queryFn: async () => {
      const { data } = await supabase.from('pessoas').select('id, nome, cargo').order('nome')
      return (data ?? []) as Pick<Pessoa, 'id' | 'nome' | 'cargo'>[]
    },
  })

  const handleFile = (f: File) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError(null)
    setSaved(false)
  }

  const handleExtract = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('image', file)
      if (pessoaId) form.append('pessoa_id', pessoaId)

      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token ?? ''

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/disc-extract`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form },
      )
      const json = await res.json()
      if (!json.success) throw new Error(json.error ?? 'Erro desconhecido')
      setResult(json.data as ExtractedDisc)
      if (pessoaId && json.saved) setSaved(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Upload */}
      <div>
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-5">
          <div className="font-bold text-gray-700 mb-1">Extração por IA</div>
          <div className="text-sm text-gray-400 mb-4">Envie uma imagem do resultado DISC — a IA extrai os valores automaticamente</div>

          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-brand hover:bg-brand/5 transition-all"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          >
            {preview ? (
              <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-lg" />
            ) : (
              <>
                <div className="text-4xl mb-3">📷</div>
                <div className="font-bold text-gray-600">Clique ou arraste a imagem</div>
                <div className="text-sm text-gray-400 mt-1">PNG, JPG, WEBP</div>
              </>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          </div>

          <div className="mt-4">
            <label className="text-sm font-semibold text-gray-600 block mb-1.5">Vincular a uma pessoa (opcional)</label>
            <select value={pessoaId} onChange={(e) => setPessoaId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30">
              <option value="">— Não vincular agora —</option>
              {pessoas?.map((p) => (
                <option key={p.id} value={p.id}>{p.nome} — {p.cargo}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExtract}
            disabled={!file || loading}
            className="mt-4 w-full bg-brand text-white rounded-xl py-2.5 font-bold text-sm disabled:opacity-50 hover:bg-brand-dark transition-colors"
          >
            {loading ? 'Extraindo...' : '🤖 Extrair com IA'}
          </button>

          {error && <div className="mt-3 p-3 bg-red-50 border-l-3 border-red-400 rounded text-sm text-red-600">{error}</div>}
          {saved && <div className="mt-3 p-3 bg-green-50 border-l-3 border-green-400 rounded text-sm text-green-600">✅ Perfil salvo no Supabase!</div>}
        </div>

        {/* Inserção manual */}
        <ManualInsert pessoas={pessoas ?? []} />
      </div>

      {/* Resultado */}
      <div>
        {result ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="font-bold text-gray-700 mb-1">Dados Extraídos pela IA</div>
            {result.provider && <div className="text-xs text-gray-400 mb-4">Provedor detectado: {result.provider}</div>}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {(['D', 'I', 'S', 'C'] as const).map((f) => {
                const fData = result.factors[f]
                const color = DISC_COLORS[f]
                return (
                  <div key={f} className="rounded-xl p-4 text-white text-center" style={{ backgroundColor: color }}>
                    <div className="text-2xl font-black">{f}</div>
                    <div className="text-xs opacity-80 mt-1">Maturidade</div>
                    <div className="text-3xl font-black">{fData.maturity}</div>
                    <div className="text-xs opacity-80 mt-2">Intensidade</div>
                    <div className="text-lg font-bold">{fData.intensity}</div>
                    <div className="text-xs opacity-80 mt-1">Reatividade</div>
                    <div className="text-sm font-bold">{(fData.intensity - fData.maturity).toFixed(1)}</div>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-2 mb-4">
              <span className="bg-brand/10 text-brand font-bold px-3 py-1 rounded-full text-sm">
                Perfil dominante: {result.dominantProfile}
              </span>
              <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-sm">
                Confiança: {result.confidence}%
              </span>
            </div>
            {result.notes && (
              <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">{result.notes}</div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center text-gray-300">
            <div className="text-5xl mb-3">🔍</div>
            <div className="font-bold text-lg">Nenhuma extração realizada</div>
            <div className="text-sm mt-1">Envie uma imagem e clique em "Extrair com IA"</div>
          </div>
        )}
      </div>
    </div>
  )
}

function ManualInsert({ pessoas }: { pessoas: Pick<Pessoa, 'id' | 'nome' | 'cargo'>[] }) {
  const [vals, setVals] = useState({ d: 50, i: 60, s: 50, c: 45, di: 60, ii: 70, si: 60, ci: 55 })
  const [pessoaId, setPessoaId] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!pessoaId) return
    const reat = Math.max(vals.di - vals.d, vals.ii - vals.i, vals.si - vals.s, vals.ci - vals.c)
    const dom = (['d', 'i', 's', 'c'] as const).reduce((a, b) => vals[a] > vals[b] ? a : b).toUpperCase()
    await supabase.from('disc_perfis').insert({
      pessoa_id: pessoaId, d_mat: vals.d, i_mat: vals.i, s_mat: vals.s, c_mat: vals.c,
      d_int: vals.di, i_int: vals.ii, s_int: vals.si, c_int: vals.ci,
      reatividade: reat, perfil_dom: dom, fonte: 'manual',
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="font-bold text-gray-700 mb-4">Inserção Manual</div>
      <select value={pessoaId} onChange={(e) => setPessoaId(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-brand/30">
        <option value="">— Selecione a pessoa —</option>
        {pessoas.map((p) => <option key={p.id} value={p.id}>{p.nome} — {p.cargo}</option>)}
      </select>
      {(['D', 'I', 'S', 'C'] as const).map((f) => {
        const color = DISC_COLORS[f]
        const mk = f.toLowerCase() as 'd' | 'i' | 's' | 'c'
        const ik = `${mk}i` as 'di' | 'ii' | 'si' | 'ci'
        return (
          <div key={f} className="mb-3">
            <div className="text-sm font-bold mb-1.5" style={{ color }}>{f} — {['Dominância','Influência','Estabilidade','Conformidade'][['D','I','S','C'].indexOf(f)]}</div>
            <div className="flex items-center gap-3">
              <span className="text-xs w-20 text-gray-500">Maturidade</span>
              <input type="range" min={0} max={100} value={vals[mk]} onChange={(e) => setVals((v) => ({ ...v, [mk]: +e.target.value }))} className="flex-1 accent-brand" />
              <span className="text-sm font-bold w-8 text-right" style={{ color }}>{vals[mk]}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs w-20 text-gray-500">Intensidade</span>
              <input type="range" min={0} max={100} value={vals[ik]} onChange={(e) => setVals((v) => ({ ...v, [ik]: +e.target.value }))} className="flex-1 accent-brand" />
              <span className="text-sm font-bold w-8 text-right" style={{ color }}>{vals[ik]}</span>
            </div>
          </div>
        )
      })}
      <button onClick={handleSave} disabled={!pessoaId}
        className="mt-2 w-full bg-brand text-white rounded-xl py-2.5 font-bold text-sm disabled:opacity-50 hover:bg-brand-dark transition-colors">
        Salvar Perfil
      </button>
      {saved && <div className="mt-2 text-center text-sm text-green-600 font-bold">✅ Salvo!</div>}
    </div>
  )
}
