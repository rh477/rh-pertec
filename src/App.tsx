import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Colaboradores from './pages/Colaboradores'
import AnaliseDisc from './pages/AnaliseDisc'
import Ranking from './pages/Ranking'
import Comparar from './pages/Comparar'
import Relatorio from './pages/Relatorio'
import Cargos from './pages/Cargos'
import PDI from './pages/PDI'
import Avaliacoes from './pages/Avaliacoes'
import Clima from './pages/Clima'
import ENPS from './pages/ENPS'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="colaboradores" element={<Colaboradores />} />
        <Route path="analise" element={<AnaliseDisc />} />
        <Route path="ranking" element={<Ranking />} />
        <Route path="comparar" element={<Comparar />} />
        <Route path="relatorio" element={<Relatorio />} />
        <Route path="cargos" element={<Cargos />} />
        <Route path="pdi" element={<PDI />} />
        <Route path="avaliacoes" element={<Avaliacoes />} />
        <Route path="clima" element={<Clima />} />
        <Route path="enps" element={<ENPS />} />
      </Route>
    </Routes>
  )
}
