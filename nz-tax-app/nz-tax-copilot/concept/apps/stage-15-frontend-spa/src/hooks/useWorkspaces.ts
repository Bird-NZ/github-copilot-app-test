import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkspaces, createWorkspace, getWorkspace } from '../api/workspaces';

export const useWorkspaces = () => {
  const queryClient = useQueryClient();

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: getWorkspaces,
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });

  return {
    workspaces: workspaces || [],
    isLoading,
    createWorkspace: createWorkspaceMutation.mutateAsync,
  };
};

export const useWorkspace = (workspaceId: string) => {
  const { data: workspace, isLoading } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => getWorkspace(workspaceId),
    enabled: !!workspaceId,
  });

  return {
    workspace,
    isLoading,
  };
};