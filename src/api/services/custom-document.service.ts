import { Endpoints } from '../endpoint'
import { httpClient } from '../http'
import type { PageTurnSettings } from '../../lib/pageTurnSettings'

export type LogoPosition =
  | 'top_left'
  | 'top_center'
  | 'top_right'
  | 'center_left'
  | 'center'
  | 'center_right'
  | 'bottom_left'
  | 'bottom_center'
  | 'bottom_right'

export type PageEffect =
  | 'magazine'
  | 'book'
  | 'album'
  | 'notebook'
  | 'slider'
  | 'cards'
  | 'coverflow'
  | 'one_page'

export type PageDisposition =
  | 'adaptive'
  | 'always_double_page'
  | 'always_single_page'

export interface CustomDocumentAppearance {
  backgroundColor: string | null
  backgroundImage: string | null
  logoImage: string | null
  logoPosition: LogoPosition
  logoSize: number | null
  logoOpacity: number
  logoLinkUrl: string | null
  pageEffect: PageEffect
  pageDisposition: PageDisposition
  /** Options Turn.js (son, RTL, ombres, etc.) — null = défauts côté client */
  pageTurnSettings?: PageTurnSettings | null
}

export interface CustomDocumentPermissions {
  allowDownload: boolean
  allowShare: boolean
  allowPrint: boolean
  allowFullscreen: boolean
  allowPrevNext: boolean
  allowZoom: boolean
  allowFirstPage: boolean
  allowLastPage: boolean
  allowSearchText: boolean
}

export interface CustomDocumentResponse {
  documentId: string
  appearance: CustomDocumentAppearance
  permissions: CustomDocumentPermissions
  updatedAt: string
}

export type UpdateCustomDocumentDto = Partial<
  Omit<CustomDocumentAppearance, 'logoImage'> &
    CustomDocumentPermissions & {
      logoImage: null
    }
>

export type UpdateBackgroundDto = Pick<
  UpdateCustomDocumentDto,
  'backgroundColor' | 'backgroundImage'
>

export type UpdateLogoSettingsDto = Pick<
  UpdateCustomDocumentDto,
  'logoImage' | 'logoPosition' | 'logoSize' | 'logoOpacity' | 'logoLinkUrl'
>

export type UpdatePageEffectDto = Pick<
  UpdateCustomDocumentDto,
  'pageEffect' | 'pageDisposition' | 'pageTurnSettings'
>

export type UpdateControlsDto = Partial<CustomDocumentPermissions>

export const customDocumentService = {
  details(documentId: string): Promise<CustomDocumentResponse> {
    return httpClient.get<CustomDocumentResponse>(
      Endpoints.customDocuments.details(documentId),
    )
  },

  update(
    documentId: string,
    payload: UpdateCustomDocumentDto,
  ): Promise<CustomDocumentResponse> {
    return httpClient.patch<CustomDocumentResponse, UpdateCustomDocumentDto>(
      Endpoints.customDocuments.update(documentId),
      payload,
    )
  },

  updateBackground(
    documentId: string,
    payload: UpdateBackgroundDto,
  ): Promise<CustomDocumentResponse> {
    return this.update(documentId, payload)
  },

  updateLogoSettings(
    documentId: string,
    payload: UpdateLogoSettingsDto,
  ): Promise<CustomDocumentResponse> {
    return this.update(documentId, payload)
  },

  updatePageEffect(
    documentId: string,
    payload: UpdatePageEffectDto,
  ): Promise<CustomDocumentResponse> {
    return this.update(documentId, payload)
  },

  updateControls(
    documentId: string,
    payload: UpdateControlsDto,
  ): Promise<CustomDocumentResponse> {
    return this.update(documentId, payload)
  },

  uploadLogo(documentId: string, file: File): Promise<CustomDocumentResponse> {
    const formData = new FormData()
    formData.append('file', file)

    return httpClient.patch<CustomDocumentResponse, FormData>(
      Endpoints.customDocuments.uploadLogo(documentId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
  },

  uploadBackgroundImage(
    documentId: string,
    file: File,
  ): Promise<CustomDocumentResponse> {
    const formData = new FormData()
    formData.append('file', file)

    return httpClient.patch<CustomDocumentResponse, FormData>(
      Endpoints.customDocuments.uploadBackgroundImage(documentId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
  },
}
