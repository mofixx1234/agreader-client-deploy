import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'

type UploadModalContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
}

const UploadModalContext = createContext<UploadModalContextValue | null>(null)

export function UploadModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const open = useCallback(() => {
    navigate('/dashboard')
    setIsOpen(true)
  }, [navigate])

  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo(
    () => ({ isOpen, open, close }),
    [isOpen, open, close],
  )

  return (
    <UploadModalContext.Provider value={value}>
      {children}
    </UploadModalContext.Provider>
  )
}

export function useUploadModal() {
  const ctx = useContext(UploadModalContext)
  if (!ctx) {
    throw new Error('useUploadModal doit être utilisé dans UploadModalProvider')
  }
  return ctx
}
