import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  customDocumentService,
  type UpdateBackgroundDto,
  type UpdateControlsDto,
  type UpdateCustomDocumentDto,
  type UpdateLogoSettingsDto,
  type UpdatePageEffectDto,
} from '../services/custom-document.service'

interface UpdateCustomDocumentVariables {
  documentId: string
  payload: UpdateCustomDocumentDto
}

interface UploadLogoVariables {
  documentId: string
  file: File
}

interface UploadBackgroundImageVariables {
  documentId: string
  file: File
}

interface UpdateBackgroundVariables {
  documentId: string
  payload: UpdateBackgroundDto
}

interface UpdateLogoSettingsVariables {
  documentId: string
  payload: UpdateLogoSettingsDto
}

interface UpdatePageEffectVariables {
  documentId: string
  payload: UpdatePageEffectDto
}

interface UpdateControlsVariables {
  documentId: string
  payload: UpdateControlsDto
}

export const useCustomDocuments = () => {
  const queryClient = useQueryClient()

  const useDetails = (documentId: string) =>
    useQuery({
      queryKey: ['custom-document', documentId],
      queryFn: () => customDocumentService.details(documentId),
      enabled: !!documentId,
    })

  const update = useMutation({
    mutationFn: ({ documentId, payload }: UpdateCustomDocumentVariables) =>
      customDocumentService.update(documentId, payload),

    onSuccess: (data) => {
      queryClient.setQueryData(['custom-document', data.documentId], data)
      queryClient.invalidateQueries({ queryKey: ['document', data.documentId] })
      queryClient.invalidateQueries({
        queryKey: ['document-public', data.documentId],
      })
    },
  })

  const uploadLogo = useMutation({
    mutationFn: ({ documentId, file }: UploadLogoVariables) =>
      customDocumentService.uploadLogo(documentId, file),

    onSuccess: (data) => {
      queryClient.setQueryData(['custom-document', data.documentId], data)
      queryClient.invalidateQueries({ queryKey: ['document', data.documentId] })
      queryClient.invalidateQueries({
        queryKey: ['document-public', data.documentId],
      })
    },
  })

  const uploadBackgroundImage = useMutation({
    mutationFn: ({ documentId, file }: UploadBackgroundImageVariables) =>
      customDocumentService.uploadBackgroundImage(documentId, file),
    onSuccess: (data) => {
      queryClient.setQueryData(['custom-document', data.documentId], data)
      queryClient.invalidateQueries({ queryKey: ['document', data.documentId] })
      queryClient.invalidateQueries({
        queryKey: ['document-public', data.documentId],
      })
    },
  })

  const updateBackground = useMutation({
    mutationFn: ({ documentId, payload }: UpdateBackgroundVariables) =>
      customDocumentService.updateBackground(documentId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['custom-document', data.documentId], data)
      queryClient.invalidateQueries({ queryKey: ['document', data.documentId] })
      queryClient.invalidateQueries({
        queryKey: ['document-public', data.documentId],
      })
    },
  })

  const updateLogoSettings = useMutation({
    mutationFn: ({ documentId, payload }: UpdateLogoSettingsVariables) =>
      customDocumentService.updateLogoSettings(documentId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['custom-document', data.documentId], data)
      queryClient.invalidateQueries({ queryKey: ['document', data.documentId] })
      queryClient.invalidateQueries({
        queryKey: ['document-public', data.documentId],
      })
    },
  })

  const updatePageEffect = useMutation({
    mutationFn: ({ documentId, payload }: UpdatePageEffectVariables) =>
      customDocumentService.updatePageEffect(documentId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['custom-document', data.documentId], data)
      queryClient.invalidateQueries({ queryKey: ['document', data.documentId] })
      queryClient.invalidateQueries({
        queryKey: ['document-public', data.documentId],
      })
    },
  })

  const updateControls = useMutation({
    mutationFn: ({ documentId, payload }: UpdateControlsVariables) =>
      customDocumentService.updateControls(documentId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['custom-document', data.documentId], data)
      queryClient.invalidateQueries({ queryKey: ['document', data.documentId] })
      queryClient.invalidateQueries({
        queryKey: ['document-public', data.documentId],
      })
    },
  })

  return {
    useDetails,
    update,
    uploadLogo,
    uploadBackgroundImage,
    updateBackground,
    updateLogoSettings,
    updatePageEffect,
    updateControls,
  }
}
