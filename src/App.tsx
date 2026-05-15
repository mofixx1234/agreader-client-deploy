import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { EditorLayout } from './layouts/EditorLayout'
import { MainLayout } from './layouts/MainLayout'
import { AccountPage } from './pages/AccountPage'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PublicFlipbookPage } from './pages/PublicFlipbookPage'
import { StatsPage } from './pages/StatsPage'
import { SupportPage } from './pages/SupportPage'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/editor/:id" element={<EditorLayout />} />
      </Route>

      <Route path="/public/:id" element={<PublicFlipbookPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
