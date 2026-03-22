import apiClient from './apiClient'

export interface Workspace {
  id: string
  userId: string
  taxYear: number
  status: string
  createdAt: string
  updatedAt: string
  metadata: {
    completedQuestionnaire: boolean
    hasIncomeEntries: boolean
    hasCryptoTransactions: boolean
    hasDocuments: boolean
  }
}

export const workspaceApi = {
  async list(token: string): Promise<Workspace[]> {
    const response = await apiClient.get('/api/v1/workspaces', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  async get(workspaceId: string, token: string): Promise<Workspace> {
    const response = await apiClient.get(`/api/v1/workspaces/${workspaceId}`, {

---
**Governance warnings:**
- Possible hard-coded value detected — externalize secrets to Key Vault or use managed identity.