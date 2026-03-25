import apiClient from './apiClient'

export type QuestionnaireAnswers = Record<string, boolean>

export type QuestionnaireQuestion = {
  id: string
  type: string
  label: string
}

export type QuestionnaireStatus = {
  totalVisible: number
  answeredVisible: number
  complete: boolean
}

export type QuestionnaireResult = {
  answers: QuestionnaireAnswers
  visible: QuestionnaireQuestion[]
  status: QuestionnaireStatus
}

export type PayeIncomeItem = {
  id: string
  gross?: number
  payeWithheld?: number
  amount?: number
  sourceName?: string
  createdAt?: string
}

export type IncomeBucket = {
  paye: PayeIncomeItem[]
  interest: PayeIncomeItem[]
  dividends: PayeIncomeItem[]
  other: PayeIncomeItem[]
}

export type CryptoTransaction = {
  id: string
  occurredAt: string
  asset: string
  type: string
  amount: number
  priceNzd: number
  feeNzd: number
  source?: string
}

export type WorkspaceDocument = {
  id: string
  workspaceId: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  docType: string
  status: string
  uploadedAt: string
}

export type ChecklistItem = {
  docType: string
  status: 'missing' | 'received'
  count: number
}

export type AuditEvent = {
  at: string
  action: string
  actor: string
  meta?: Record<string, unknown>
}

export type Ir3CalcResult = {
  map: Record<string, unknown>
  calc: Record<string, unknown>
  explanation?: {
    headline?: string
    bullets?: string[]
    fieldNotes?: Array<{ ref: string; note: string }>
  }
}

export type DraftExport = {
  csv: string
  explanation?: {
    headline?: string
    bullets?: string[]
    fieldNotes?: Array<{ ref: string; note: string }>
  }
  pdf: {
    title: string
    generatedAt: string
    mimeType: string
    filename: string
    bytesBase64: string
    sections: Array<{ name: string; values: Record<string, unknown> }>
  }
}

export const workspaceFlowsApi = {
  async getQuestionnaire(workspaceId: string): Promise<QuestionnaireResult> {
    const response = await apiClient.get(`/workspaces/${workspaceId}/questionnaire`)
    return response.data
  },

  async saveQuestionnaire(workspaceId: string, answers: QuestionnaireAnswers): Promise<QuestionnaireResult> {
    const response = await apiClient.put(`/workspaces/${workspaceId}/questionnaire`, { answers })
    return response.data
  },

  async addIncome(
    workspaceId: string,
    type: 'paye' | 'interest' | 'dividends' | 'other',
    payload: Record<string, unknown>
  ): Promise<PayeIncomeItem> {
    const response = await apiClient.post(`/workspaces/${workspaceId}/income/${type}`, payload)
    return response.data?.item
  },

  async listIncome(workspaceId: string): Promise<IncomeBucket> {
    const response = await apiClient.get(`/workspaces/${workspaceId}/income`)
    return response.data?.income
  },

  async uploadDocument(workspaceId: string, file: File, docType: string): Promise<WorkspaceDocument> {
    const form = new FormData()
    form.append('file', file)
    form.append('docType', docType)
    const response = await apiClient.post(`/workspaces/${workspaceId}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data?.document
  },

  async listDocuments(workspaceId: string): Promise<WorkspaceDocument[]> {
    const response = await apiClient.get(`/workspaces/${workspaceId}/documents`)
    return response.data?.items || []
  },

  async getChecklist(workspaceId: string): Promise<ChecklistItem[]> {
    const response = await apiClient.get(`/workspaces/${workspaceId}/checklist`)
    return response.data?.checklist || []
  },

  async getAudit(workspaceId: string): Promise<AuditEvent[]> {
    const response = await apiClient.get(`/workspaces/${workspaceId}/audit`)
    return response.data?.events || []
  },

  async importCryptoCsv(workspaceId: string, csv: string): Promise<{ imported: number; total: number }> {
    const response = await apiClient.post(`/workspaces/${workspaceId}/crypto/import-csv`, { csv })
    return response.data
  },

  async listCryptoTransactions(workspaceId: string): Promise<CryptoTransaction[]> {
    const response = await apiClient.get(`/workspaces/${workspaceId}/crypto/transactions`)
    return response.data?.items || []
  },

  async getIr3Calc(workspaceId: string): Promise<Ir3CalcResult> {
    const response = await apiClient.get(`/workspaces/${workspaceId}/ir3/calc`)
    return response.data
  },

  async getDraftExport(workspaceId: string): Promise<DraftExport> {
    const response = await apiClient.get(`/workspaces/${workspaceId}/export/draft`)
    return response.data
  },
}
