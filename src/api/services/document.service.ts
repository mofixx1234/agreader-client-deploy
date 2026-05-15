// services/document.service.ts

import { httpClient } from "../http";
import { Endpoints } from "../endpoint";
import type {
  CustomDocumentAppearance,
  CustomDocumentPermissions,
} from "./custom-document.service";

// =============================================
// TYPES
// =============================================

export interface DocumentConversion {
  status: string;
  step: string;
  progress: number;
  attempt: number;
  maxAttempts: number;
  runAfter: string | null;
  lastError: string | null;
}

export interface DocumentItem {
  documentId: string;

  originalName: string;

  mimeType: string;

  sizeBytes: string;

  status: string;

  pageCount: number | null;

  sourceUrl: string | null;

  pdfUrl: string | null;

  errorMessage: string | null;
  coverUrl: string | null;
  createdAt: string;

  updatedAt: string;

  conversion: DocumentConversion | null;
}

export interface DocumentPage {
  pageIndex: number;

  imageUrl: string;

  width: number;

  height: number;

  thumbUrl: string | null;
}

export interface DocumentPagesResponse {
  documentId: string;

  status: string;

  pageCount: number;

  pages: DocumentPage[];
}

export interface DocumentPublicViewResponse {
  ok: true;
  documentId: string;
  status: string;
  originalName: string;
  mimeType?: string;
  sizeBytes?: string;
  pageCount: number;
  sourceUrl: string | null;
  pdfUrl: string | null;
  pages: DocumentPage[];
  appearance?: CustomDocumentAppearance;
  permissions?: CustomDocumentPermissions;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentProgress {
  documentId: string;

  status: string;

  step: string;

  progress: number;

  errorMessage: string | null;
}

export interface UploadDocumentResponse {
  documentId: string;

  status: string;
}

export interface DeleteDocumentResponse {
  ok: boolean;
}

export interface ListDocumentsResponse {
  data: DocumentItem[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============================================
// SERVICE
// =============================================

export const documentService = {
  // ===========================================
  // LIST DOCUMENTS
  // ===========================================

  list(): Promise<DocumentItem[]> {
    return httpClient
      .get<DocumentItem[]>(Endpoints.documents.list)
      .then((res) => {
        console.log("DOCUMENTS RESPONSE", res);

        return res;
      });
  },

  // ===========================================
  // DOCUMENT DETAILS
  // ===========================================

  details(id: string): Promise<DocumentItem> {
    return httpClient.get<DocumentItem>(Endpoints.documents.details(id));
  },

  publicView(id: string): Promise<DocumentPublicViewResponse> {
    return httpClient.get<DocumentPublicViewResponse>(Endpoints.documents.public(id));
  },

  // ===========================================
  // DOCUMENT PAGES
  // ===========================================

  pages(id: string): Promise<DocumentPagesResponse> {
    return httpClient.get<DocumentPagesResponse>(Endpoints.documents.pages(id));
  },

  // ===========================================
  // DOCUMENT PROGRESS
  // ===========================================

  progress(id: string): Promise<DocumentProgress> {
    return httpClient.get<DocumentProgress>(Endpoints.documents.progress(id));
  },

  // ===========================================
  // RETRY DOCUMENT
  // ===========================================

  retry(id: string) {
    return httpClient.post(Endpoints.documents.retry(id));
  },

  // ===========================================
  // DELETE DOCUMENT
  // ===========================================

  deleteDocument(id: string): Promise<DeleteDocumentResponse> {
    return httpClient.delete<DeleteDocumentResponse>(
      Endpoints.documents.delete(id),
    );
  },

  // ===========================================
  // UPLOAD DOCUMENT
  // ===========================================

  upload(file: File): Promise<UploadDocumentResponse> {
    const formData = new FormData();

    formData.append("file", file);

    return httpClient.post<UploadDocumentResponse>(
      Endpoints.documents.upload,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },
};
