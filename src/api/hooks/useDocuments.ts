// hooks/useDocuments.ts

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { documentService } from '../services/document.service'

export const useDocuments = () => {
  const queryClient = useQueryClient()

  // =============================================
  // QUERIES
  // =============================================

  const useList = () =>
    useQuery({
      queryKey: ['documents'],
      queryFn: documentService.list,
    })

  const useDetails = (id: string) =>
    useQuery({
      queryKey: ['document', id],
      queryFn: () => documentService.details(id),
      enabled: !!id,
    })

  const usePages = (id: string) =>
    useQuery({
      queryKey: ['document-pages', id],
      queryFn: () => documentService.pages(id),
      enabled: !!id,
    })

  const usePublicView = (id: string) =>
    useQuery({
      queryKey: ['document-public', id],
      queryFn: () => documentService.publicView(id),
      enabled: !!id,
    })

  const useProgress = (id: string) =>
    useQuery({
      queryKey: ['document-progress', id],
      queryFn: () => documentService.progress(id),
      enabled: !!id,

      refetchInterval: (query) => {
        const data = query.state.data

        if (!data) return 2000

        if (data.progress >= 100) {
          return false
        }

        return 2000
      },
    })

  // =============================================
  // MUTATIONS
  // =============================================

  const upload = useMutation({
    mutationFn: (file: File) =>
      documentService.upload(file),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['documents'],
      })
    },
  })

  const retry = useMutation({
    mutationFn: (id: string) =>
      documentService.retry(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ['documents'],
      })

      queryClient.invalidateQueries({
        queryKey: ['document-progress', id],
      })
    },
  })

  const deleteDocument = useMutation({
    mutationFn: (id: string) => documentService.deleteDocument(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.removeQueries({ queryKey: ['document', id] })
      queryClient.removeQueries({ queryKey: ['document-pages', id] })
      queryClient.removeQueries({ queryKey: ['document-progress', id] })
    },
  })

  // =============================================
  // RETURN
  // =============================================

  return {
    useList,
    useDetails,
    usePages,
    usePublicView,
    useProgress,

    upload,
    retry,
    deleteDocument,
  }
}