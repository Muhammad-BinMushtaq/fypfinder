import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { groupKeys } from "@/hooks/group/useMyGroup";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type MilestoneStatus = "UPCOMING" | "IN_PROGRESS" | "COMPLETED";
export type SupervisorStatus = "NOT_DECIDED" | "APPROACHED" | "CONFIRMED";

export interface FYPMilestoneItem {
  id: string;
  title: string;
  dueDate: string | null;
  status: MilestoneStatus;
  note: string | null;
}

export interface CustomResourceLink {
  id: string;
  label: string;
  url: string;
  category?: "THESIS" | "SLIDES" | "DATASET" | "OTHER";
}

export interface SupervisorActionItem {
  id: string;
  text: string;
  completed: boolean;
  linkedTaskId?: string | null;
}

export interface SupervisorMeetingItem {
  id: string;
  date: string;
  summary: string;
  actionItems: SupervisorActionItem[];
  createdByName?: string | null;
  createdAt: string;
}

export interface GroupWorkspaceMeta {
  groupId: string;
  repoUrl: string | null;
  docsUrl: string | null;
  demoUrl: string | null;
  supervisorName: string | null;
  supervisorStatus: SupervisorStatus;
  domainTrack: string | null;
  milestones: FYPMilestoneItem[];
  customLinks?: CustomResourceLink[];
  memberRoles?: Record<string, string>;
  supervisorMeetings?: SupervisorMeetingItem[];
}

export interface FYPTask {
  id: string;
  groupId: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  assignedToId: string | null;
  dueDate: string | null;
  priority?: TaskPriority;
  deliverableUrl?: string | null;
  milestoneId?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: {
    id: string;
    name: string;
    profilePicture: string | null;
  } | null;
}

const fetchTasks = async (): Promise<FYPTask[]> => {
  const res = await fetch("/api/group/workspace/tasks");
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const useGroupTasks = (groupId: string, enabled = true) => {
  return useQuery({
    queryKey: ["workspace", "tasks", groupId],
    queryFn: fetchTasks,
    enabled: !!groupId && enabled,
    staleTime: 60 * 1000,
  });
};

export const useCreateTask = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      assignedToId?: string;
      dueDate?: string;
      priority?: TaskPriority;
      deliverableUrl?: string | null;
      milestoneId?: string | null;
    }) => {
      const res = await fetch("/api/group/workspace/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data as FYPTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", "tasks", groupId],
      });
    },
  });
};

export const useCreateBatchTasks = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      batchItems: Array<{
        title: string;
        description?: string;
        priority?: TaskPriority;
        milestoneId?: string | null;
      }>
    ) => {
      const res = await fetch("/api/group/workspace/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchItems }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data as FYPTask[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", "tasks", groupId],
      });
    },
  });
};

export const useUpdateTask = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      taskId: string;
      title?: string;
      description?: string;
      status?: string;
      assignedToId?: string | null;
      dueDate?: string | null;
      priority?: TaskPriority;
      deliverableUrl?: string | null;
      milestoneId?: string | null;
    }) => {
      const res = await fetch(`/api/group/workspace/tasks/${data.taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data as FYPTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", "tasks", groupId],
      });
    },
  });
};

export const useDeleteTask = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/group/workspace/tasks/${taskId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", "tasks", groupId],
      });
    },
  });
};

export const useWorkspaceMeta = (
  groupId: string,
  enabled = true,
  initialData?: GroupWorkspaceMeta
) => {
  return useQuery<GroupWorkspaceMeta>({
    queryKey: ["workspace", "meta", groupId],
    queryFn: async () => {
      const res = await fetch("/api/group/workspace/meta");
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    enabled: !!groupId && enabled,
    initialData,
    staleTime: 5 * 60 * 1000,
  });
};

export type UpdateWorkspaceMetaPayload = Partial<GroupWorkspaceMeta> & {
  projectName?: string;
  description?: string | null;
};

export const useUpdateWorkspaceMeta = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (partial: UpdateWorkspaceMetaPayload) => {
      const res = await fetch("/api/group/workspace/meta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data as GroupWorkspaceMeta;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", "meta", groupId],
      });
      queryClient.invalidateQueries({
        queryKey: groupKeys.myGroup(),
      });
    },
  });
};
