import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export type Pessoa = {
  id: string
  codigo: string
  nome: string
  cargo: string
  tipo: 'colaborador' | 'candidato'
  nivel_ref: string
  setor: string | null
  email: string | null
  status: 'ativo' | 'inativo' | 'processo'
  nota: string | null
  disc_perfis?: DiscPerfil[]
}

export type DiscPerfil = {
  id: string
  pessoa_id: string
  d_mat: number
  i_mat: number
  s_mat: number
  c_mat: number
  d_int: number | null
  i_int: number | null
  s_int: number | null
  c_int: number | null
  reatividade: number | null
  perfil_dom: string | null
  provider: string | null
  confianca: number | null
  fonte: 'ia' | 'manual'
  data_avaliacao: string
}

export type CargoIdeal = {
  id: string
  nivel_ref: string
  label: string
  setor: string | null
  descricao: string | null
  d_min: number; d_max: number
  i_min: number; i_max: number
  s_min: number; s_max: number
  c_min: number; c_max: number
  max_reat: number
  peso_d: number; peso_i: number; peso_s: number; peso_c: number
  peso_desc: string | null
}

export function calcFactorScore(val: number, min: number, max: number): number {
  if (val >= min && val <= max) return 100
  if (val < min) return (val / min) * 100
  const excess = val - max
  const room = 100 - max
  return Math.max(40, 100 - (excess / (room || 1)) * 60)
}

export function calcFit(profile: DiscPerfil, ideal: CargoIdeal): number {
  const factors = ['d', 'i', 's', 'c'] as const
  let weighted = 0
  factors.forEach((f) => {
    const score = calcFactorScore(
      profile[`${f}_mat`] as number,
      ideal[`${f}_min`] as number,
      ideal[`${f}_max`] as number,
    )
    weighted += score * (ideal[`peso_${f}`] as number)
  })
  const reatExcess = Math.max(0, (profile.reatividade ?? 0) - ideal.max_reat)
  return Math.round(Math.max(0, weighted - reatExcess * 0.6))
}

export function scoreStatus(s: number) {
  if (s >= 85) return { color: 'text-green-600 bg-green-100', icon: '✅', label: 'Recomendado' }
  if (s >= 70) return { color: 'text-yellow-600 bg-yellow-100', icon: '🟡', label: 'Viável c/ desenvolvimento' }
  if (s >= 50) return { color: 'text-orange-600 bg-orange-100', icon: '⚠️', label: 'Risco moderado' }
  return { color: 'text-red-600 bg-red-100', icon: '❌', label: 'Não recomendado' }
}

export const DISC_COLORS = { D: '#e74c3c', I: '#f39c12', S: '#27ae60', C: '#2980b9' }
export const DISC_LABELS = { D: 'Dominância', I: 'Influência', S: 'Estabilidade', C: 'Conformidade' }
