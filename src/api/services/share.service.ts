// services/share.service.ts

import { httpClient } from '../http'
import { Endpoints } from '../endpoint'

// =============================================
// TYPES
// =============================================

export interface CreateShareDto {
  documentId: string
  expiresAt?: string
  allowDownload?: boolean
}

export interface ShareItem {
  token: string
  url: string
  documentId: string
  allowDownload: boolean
  expiresAt?: string
  createdAt: string
}

export interface ShareDetails {
  token: string
  document: {
    id: string
    name: string
    totalPages: number
  }
  pages: {
    id: string
    pageNumber: number
    imageUrl: string
  }[]
}

// =============================================
// SERVICE
// =============================================

export const shareService = {
  // CREATE SHARE
  create(payload: CreateShareDto): Promise<ShareItem> {
    return httpClient.post<ShareItem>(
      Endpoints.shares.create,
      payload,
    )
  },

  // SHARE DETAILS
  details(token: string): Promise<ShareDetails> {
    return httpClient.get<ShareDetails>(
      Endpoints.shares.details(token),
    )
  },
}