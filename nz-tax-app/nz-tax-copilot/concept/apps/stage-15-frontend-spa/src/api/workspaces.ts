import apiClient from './apiClient';
import type { WorkspaceReview } from '../types/api';

export interface Workspace {
  id: string;
  userId: string;
  taxYear: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    completedQuestionnaire?: boolean;
    hasIncomeEntries?: boolean;
    hasCryptoTransactions?: boolean;
    hasDocuments?: boolean;
  };
}

export interface CreateWorkspaceRequest {
  taxYear: number;
}

export const workspaceApi = {
  async listWorkspaces(): Promise<Workspace[]> {
    const response = await apiClient.get('/api/v1/workspaces');
    return response.data;
  },

  async getWorkspace(workspaceId: string): Promise<Workspace> {
    const response = await apiClient.get(`/api/v1/workspaces/${workspaceId}`);
    return response.data;
  },

  async getReview(workspaceId: string): Promise<WorkspaceReview> {
    const response = await apiClient.get(`/workspaces/${workspaceId}/review`);
    return response.data.review;
  },

  async createWorkspace(taxYear: number): Promise<Workspace> {
    const response = await apiClient.post('/api/v1/workspaces', { taxYear });
    return response.data;
  },

  async deleteWorkspace(workspaceId: string): Promise<void> {
    await apiClient.delete(`/api/v1/workspaces/${workspaceId}`);
  },
};
