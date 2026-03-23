import apiClient from './apiClient'

export interface Workspace {
  id: string
  userId: string
  taxYear?: number
  taxYearStart?: string
  taxYearEnd?: string
  status?: string
  createdAt?: string
  updatedAt?: string
  metadata?: {
    completedQuestionnaire?: boolean
    hasIncomeEntries?: boolean
    hasCryptoTransactions?: boolean
    hasDocuments?: boolean
  }
}

export const workspaceApi = {
  async list(): Promise<Workspace[]> {
    const response = await apiClient.get('/workspaces')
    return response.data?.items || []
  },

  async get(workspaceId: string): Promise<Workspace> {
    const response = await apiClient.get(`/workspaces/${workspaceId}`)
    return response.data?.workspace
  },

  async create(payload: { taxYearStart: string; taxYearEnd: string }): Promise<Workspace> {
    const response = await apiClient.post('/workspaces', payload)
    return response.data?.workspace
  },
}
