import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface FYPTask {
  id: string;
  groupId: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  assignedToId: string | null;
  dueDate: string | null;
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

export const useGroupTasks = (groupId: string) => {
  return useQuery({
    queryKey: ["workspace", "tasks", groupId],
    queryFn: fetchTasks,
  });
};

export const useCreateTask = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; assignedToId?: string; dueDate?: string }) => {
      const res = await fetch("/api/group/workspace/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", "tasks", groupId] });
    },
  });
};

export const useUpdateTask = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { taskId: string; title?: string; description?: string; status?: string; assignedToId?: string | null; dueDate?: string | null }) => {
      const res = await fetch(`/api/group/workspace/tasks/${data.taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", "tasks", groupId] });
    },
  });
};

export const useDeleteTask = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/group/workspace/tasks/${taskId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", "tasks", groupId] });
    },
  });
};
