// hooks/useShares.ts

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import type {
  CreateShareDto
} from '../services/share.service'
import { shareService } from '../services/share.service'

export const useShares = () => {
  const queryClient = useQueryClient()

  // =============================================
  // GET SHARE DETAILS
  // =============================================

  const useDetails = (token: string) =>
    useQuery({
      queryKey: ['share', token],
      queryFn: () => shareService.details(token),
      enabled: !!token,
    })

  // =============================================
  // CREATE SHARE
  // =============================================

  const create = useMutation({
    mutationFn: (payload: CreateShareDto) =>
      shareService.create(payload),

    onSuccess: (data) => {
      queryClient.setQueryData(
        ['share', data.token],
        data,
      )
    },
  })

  // =============================================
  // RETURN
  // =============================================

  return {
    useDetails,

    create,
  }
}