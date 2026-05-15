import { Outlet } from 'react-router-dom'
import { AppNavbar } from '../components/AppNavbar'
import { UploadModal } from '../components/UploadModal'
import { useUploadModal } from '../contexts/UploadModalContext'

export function MainLayout() {
  const { isOpen, close } = useUploadModal()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AppNavbar />
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
      <UploadModal open={isOpen} onClose={close} />
    </div>
  )
}
