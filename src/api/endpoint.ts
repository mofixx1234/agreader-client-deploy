export const Endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    me: '/auth/me',
    logout: '/auth/logout',
  },

  documents: {
    list: '/documents',
    upload: '/documents/upload',
    details: (id: string) => `/documents/${id}`,
    delete: (id: string) => `/documents/${id}`,
    public: (id: string) => `/documents/${id}/public`,
    pages: (id: string) => `/documents/${id}/pages`,
    progress: (id: string) => `/documents/${id}/progress`,
    retry: (id: string) => `/documents/${id}/retry`,
  },

  customDocuments: {
    details: (documentId: string) => `/custom-documents/${documentId}`,
    update: (documentId: string) => `/custom-documents/${documentId}`,
    uploadLogo: (documentId: string) => `/custom-documents/${documentId}/logo`,
    uploadBackgroundImage: (documentId: string) =>
      `/custom-documents/${documentId}/background-image`,
  },

  shares: {
    create: '/shares',
    details: (token: string) => `/shares/${token}`,
  },

  analytics: {
    dashboard: '/analytics/dashboard',
  },
}