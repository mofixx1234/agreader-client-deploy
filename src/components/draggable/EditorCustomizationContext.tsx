import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { toast } from 'react-toastify'
import { useCustomDocuments } from '../../api/hooks/useCustomDocuments'
import type { ApiError } from '../../api/http'
import type {
  CustomDocumentResponse,
  UpdateBackgroundDto,
  UpdateControlsDto,
  UpdateCustomDocumentDto,
  UpdateLogoSettingsDto,
  UpdatePageEffectDto,
} from '../../api/services/custom-document.service'

function saveErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as ApiError).message
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  return "Impossible d'enregistrer les modifications."
}

type EditorCustomizationContextValue = {
  documentId: string
  customization: CustomDocumentResponse | undefined
  isLoading: boolean
  isSaving: boolean
  saveCustomization: (payload: UpdateCustomDocumentDto) => Promise<CustomDocumentResponse>
  saveBackground: (payload: UpdateBackgroundDto) => Promise<CustomDocumentResponse>
  saveLogoSettings: (payload: UpdateLogoSettingsDto) => Promise<CustomDocumentResponse>
  savePageEffect: (payload: UpdatePageEffectDto) => Promise<CustomDocumentResponse>
  saveControls: (payload: UpdateControlsDto) => Promise<CustomDocumentResponse>
  uploadLogo: (file: File) => Promise<CustomDocumentResponse>
  uploadBackgroundImage: (file: File) => Promise<CustomDocumentResponse>
}

const EditorCustomizationContext =
  createContext<EditorCustomizationContextValue | null>(null)

export function EditorCustomizationProvider({
  documentId,
  children,
}: {
  documentId: string
  children: ReactNode
}) {
  const {
    useDetails,
    update,
    uploadLogo: uploadLogoMutation,
    uploadBackgroundImage: uploadBackgroundImageMutation,
    updateBackground,
    updateLogoSettings,
    updatePageEffect,
    updateControls,
  } = useCustomDocuments()
  const customizationQuery = useDetails(documentId)

  const saveCustomization = useCallback(
    async (payload: UpdateCustomDocumentDto) => {
      try {
        const data = await update.mutateAsync({ documentId, payload })
        toast.success('Personnalisation enregistrée.')
        return data
      } catch (error) {
        toast.error(saveErrorMessage(error))
        throw error
      }
    },
    [documentId, update],
  )

  const saveBackground = useCallback(
    async (payload: UpdateBackgroundDto) => {
      try {
        const data = await updateBackground.mutateAsync({ documentId, payload })
        toast.success('Arrière-plan enregistré.')
        return data
      } catch (error) {
        toast.error(saveErrorMessage(error))
        throw error
      }
    },
    [documentId, updateBackground],
  )

  const saveLogoSettings = useCallback(
    async (payload: UpdateLogoSettingsDto) => {
      try {
        const data = await updateLogoSettings.mutateAsync({ documentId, payload })
        toast.success('Paramètres du logo enregistrés.')
        return data
      } catch (error) {
        toast.error(saveErrorMessage(error))
        throw error
      }
    },
    [documentId, updateLogoSettings],
  )

  const savePageEffect = useCallback(
    async (payload: UpdatePageEffectDto) => {
      try {
        const data = await updatePageEffect.mutateAsync({ documentId, payload })
        toast.success('Effets des pages enregistrés.')
        return data
      } catch (error) {
        toast.error(saveErrorMessage(error))
        throw error
      }
    },
    [documentId, updatePageEffect],
  )

  const saveControls = useCallback(
    async (payload: UpdateControlsDto) => {
      try {
        const data = await updateControls.mutateAsync({ documentId, payload })
        toast.success('Contrôles enregistrés.')
        return data
      } catch (error) {
        toast.error(saveErrorMessage(error))
        throw error
      }
    },
    [documentId, updateControls],
  )

  const uploadLogo = useCallback(
    async (file: File) => {
      try {
        const data = await uploadLogoMutation.mutateAsync({ documentId, file })
        toast.success('Logo mis à jour.')
        return data
      } catch (error) {
        toast.error(saveErrorMessage(error))
        throw error
      }
    },
    [documentId, uploadLogoMutation],
  )

  const uploadBackgroundImage = useCallback(
    async (file: File) => {
      try {
        const data = await uploadBackgroundImageMutation.mutateAsync({
          documentId,
          file,
        })
        toast.success('Image d’arrière-plan mise à jour.')
        return data
      } catch (error) {
        toast.error(saveErrorMessage(error))
        throw error
      }
    },
    [documentId, uploadBackgroundImageMutation],
  )

  const value = useMemo<EditorCustomizationContextValue>(
    () => ({
      documentId,
      customization: customizationQuery.data,
      isLoading: customizationQuery.isPending,
      isSaving:
        update.isPending ||
        uploadLogoMutation.isPending ||
        uploadBackgroundImageMutation.isPending ||
        updateBackground.isPending ||
        updateLogoSettings.isPending ||
        updatePageEffect.isPending ||
        updateControls.isPending,
      saveCustomization,
      saveBackground,
      saveLogoSettings,
      savePageEffect,
      saveControls,
      uploadLogo,
      uploadBackgroundImage,
    }),
    [
      customizationQuery.data,
      customizationQuery.isPending,
      documentId,
      update.isPending,
      uploadLogoMutation.isPending,
      uploadBackgroundImageMutation.isPending,
      updateBackground.isPending,
      updateLogoSettings.isPending,
      updatePageEffect.isPending,
      updateControls.isPending,
      saveCustomization,
      saveBackground,
      saveLogoSettings,
      savePageEffect,
      saveControls,
      uploadLogo,
      uploadBackgroundImage,
    ],
  )

  return (
    <EditorCustomizationContext.Provider value={value}>
      {children}
    </EditorCustomizationContext.Provider>
  )
}

/** Retourne `null` hors provider (ex. page publique) — ne lance pas d’exception. */
export function useOptionalEditorCustomization() {
  return useContext(EditorCustomizationContext)
}

export function useEditorCustomization() {
  const ctx = useContext(EditorCustomizationContext)
  if (!ctx) {
    throw new Error(
      'useEditorCustomization must be used inside EditorCustomizationProvider',
    )
  }
  return ctx
}
