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

export type Ir3CalcResult = {
  map: Record<string, number>
  calc: Record<string, number>
}

export type DraftExport = {
  csv: string
  pdf: {
    title: string
    generatedAt: string
    sections: Array<{ name: string; values: Record<string, number> }>
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
