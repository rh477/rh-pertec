import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

type NavItem = { to: string; icon: string; label: string }
type NavSection = { id: string; icon: string; label: string; items: NavItem[] }

const NAV: NavSection[] = [
  {
    id: 'GP', icon: '👥', label: 'Gestão de Pessoas',
    items: [
      { to: '/colaboradores', icon: '👤', label: 'Colaboradores' },
    ],
  },
  {
    id: 'RAS', icon: '🔎', label: 'R&S',
    items: [
      { to: '/analise',      icon: '🔍', label: 'Análise de Perfil' },
      { to: '/ranking',      icon: '🏆', label: 'Ranking DISC' },
      { to: '/comparar',     icon: '⚡', label: 'Comparar Perfis' },
      { to: '/relatorio',    icon: '📋', label: 'Relatório DISC' },
      { to: '/cargos',       icon: '🎯', label: 'Perfis Ideais' },
    ],
  },
  {
    id: 'TD', icon: '🎓', label: 'T&D',
    items: [
      { to: '/avaliacoes', icon: '⭐', label: 'Avaliações' },
      { to: '/pdi',        icon: '🎯', label: 'PDI' },
    ],
  },
  {
    id: 'CLIMA', icon: '🌡️', label: 'Clima & Engajamento',
    items: [
      { to: '/clima', icon: '🌡️', label: 'Pesquisa de Clima' },
      { to: '/enps',  icon: '💜', label: 'eNPS' },
    ],
  },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const location = useLocation()

  const toggle = (id: string) =>
    setCollapsed((p) => ({ ...p, [id]: !p[id] }))

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 w-[220px] h-screen bg-sidebar text-white flex flex-col z-50 shadow-xl">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="text-[18px] font-bold tracking-wide">
            RH<span className="text-brand"> Pertec</span>
          </div>
          <div className="text-[9px] font-normal text-white/40 tracking-[1.5px] uppercase mt-0.5">Móveis</div>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn('flex items-center gap-3 px-5 py-2.5 text-[13px] rounded-r-lg mr-3 transition-all',
                isActive ? 'bg-brand text-white font-semibold' : 'text-white/65 hover:bg-brand/20 hover:text-white')
            }
          >
            <span className="text-base w-5 text-center">📊</span> Dashboard
          </NavLink>

          {NAV.map((sec) => (
            <div key={sec.id}>
              <button
                onClick={() => toggle(sec.id)}
                className="w-full flex items-center justify-between px-4 py-2.5 mr-3 text-[11px] font-extrabold uppercase tracking-[1.2px] text-white/55 hover:bg-brand/25 hover:text-white rounded-r-lg transition-all mt-1.5"
              >
                <span><span className="mr-1.5">{sec.icon}</span>{sec.label}</span>
                <span className={cn('text-[11px] opacity-60 transition-transform', collapsed[sec.id] && '-rotate-90')}>▾</span>
              </button>
              {!collapsed[sec.id] && (
                <div>
                  {sec.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn('flex items-center gap-3 pl-8 pr-5 py-2 text-[12px] rounded-r-lg mr-3 transition-all',
                          isActive ? 'bg-brand text-white font-semibold' : 'text-white/65 hover:bg-brand/20 hover:text-white')
                      }
                    >
                      <span className="text-sm w-5 text-center">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="px-5 py-3 border-t border-white/10 text-[10px] text-white/30">
          RH Pertec v1.0
        </div>
      </aside>

      {/* Main */}
      <div className="ml-[220px] flex-1 flex flex-col min-h-screen">
        <header className="bg-white px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
          <h1 className="text-xl font-bold text-gray-900">
            {location.pathname === '/dashboard' && 'Dashboard'}
            {location.pathname === '/colaboradores' && 'Colaboradores'}
            {location.pathname === '/analise' && 'Análise de Perfil DISC'}
            {location.pathname === '/ranking' && 'Ranking DISC'}
            {location.pathname === '/comparar' && 'Comparar Perfis'}
            {location.pathname === '/relatorio' && 'Relatório DISC'}
            {location.pathname === '/cargos' && 'Perfis Ideais por Cargo'}
            {location.pathname === '/pdi' && 'PDI'}
            {location.pathname === '/avaliacoes' && 'Avaliações de Desempenho'}
            {location.pathname === '/clima' && 'Pesquisa de Clima'}
            {location.pathname === '/enps' && 'eNPS'}
          </h1>
          <div className="flex items-center gap-2.5 bg-gray-100 px-3.5 py-1.5 rounded-full text-sm">
            <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white font-bold text-xs">RH</div>
            RH Pertec
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
