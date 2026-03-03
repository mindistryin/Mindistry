import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Priority } from "../backend.d";
import { dateToBigIntNs } from "../lib/localStorage";
import { useActor } from "./useActor";

// ---- Tasks ----
export function useTasks() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpcomingTasks() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tasks", "upcoming"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUpcomingTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      subjectId,
      dueDate,
      priority,
    }: {
      title: string;
      description: string;
      subjectId: string | null;
      dueDate: Date;
      priority: Priority;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTask(
        title,
        description,
        subjectId,
        dateToBigIntNs(dueDate),
        priority,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      subjectId,
      dueDate,
      priority,
      completed,
    }: {
      id: string;
      title: string;
      description: string;
      subjectId: string | null;
      dueDate: Date;
      priority: Priority;
      completed: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTask(
        id,
        title,
        description,
        subjectId,
        dateToBigIntNs(dueDate),
        priority,
        completed,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTask(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// ---- Subjects ----
export function useSubjects() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createSubject(name, color);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useUpdateSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      color,
    }: { id: string; name: string; color: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateSubject(id, name, color);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useDeleteSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteSubject(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

// ---- Materials ----
export function useMaterials() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["materials"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMaterials();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateMaterial() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
      subjectId,
      tags,
    }: {
      title: string;
      content: string;
      subjectId: string | null;
      tags: string[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createMaterial(title, content, subjectId, tags);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

export function useUpdateMaterial() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
      subjectId,
      tags,
    }: {
      id: string;
      title: string;
      content: string;
      subjectId: string | null;
      tags: string[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateMaterial(id, title, content, subjectId, tags);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

export function useDeleteMaterial() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteMaterial(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

// ---- Files ----
export function useFiles() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeleteFile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteFile(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["files"] });
    },
  });
}

// ---- User Profile ----
export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile({ name });
    },
    retry: 3,
    retryDelay: 1500,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// ---- Admin ----
export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}
