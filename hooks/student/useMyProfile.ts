// hooks/student/useMyProfile.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as studentService from "@/services/student.service";
import type { StudentProfile, Skill, Project, ExperienceLevel } from "@/services/student.service";

const PROFILE_QUERY_KEY = ["student", "my-profile"];

export function useMyProfile() {
    const queryClient = useQueryClient();

    /* ---------- FETCH PROFILE ---------- */
    const profileQuery = useQuery({
        queryKey: PROFILE_QUERY_KEY,
        queryFn: studentService.getMyProfile,
        staleTime: 20 * 60 * 1000, // 20 min
        gcTime: 30 * 60 * 1000, // 30 min
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    /* ---------- UPDATE PROFILE ---------- */
    const updateProfile = useMutation({
        mutationFn: studentService.updateMyProfile,
        onMutate: async (newData) => {
            await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY });
            const previous = queryClient.getQueryData<StudentProfile>(PROFILE_QUERY_KEY);
            if (previous) {
                queryClient.setQueryData<StudentProfile>(PROFILE_QUERY_KEY, {
                    ...previous,
                    ...newData,
                    ...(newData.currentSemester && { semester: newData.currentSemester }),
                });
            }
            return { previous };
        },
        onError: (_err, _newData, context) => {
            if (context?.previous) {
                queryClient.setQueryData(PROFILE_QUERY_KEY, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
        },
    });

    /* ---------- SKILLS ---------- */
    const addSkill = useMutation({
        mutationFn: (data: { name: string; level: ExperienceLevel; description?: string }) =>
            studentService.addSkill(data),
        onMutate: async (newSkill) => {
            await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY });
            const previous = queryClient.getQueryData<StudentProfile>(PROFILE_QUERY_KEY);
            if (previous) {
                const optimisticSkill: Skill = {
                    id: `temp-${Date.now()}`,
                    name: newSkill.name,
                    level: newSkill.level,
                    description: newSkill.description || "",
                };
                queryClient.setQueryData<StudentProfile>(PROFILE_QUERY_KEY, {
                    ...previous,
                    skills: [...(previous.skills ?? []), optimisticSkill],
                });
            }
            return { previous };
        },
        onError: (_err, _newSkill, context) => {
            if (context?.previous) {
                queryClient.setQueryData(PROFILE_QUERY_KEY, context.previous);
            }
        },
        // onSettled: () => {
        //     queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
        // },

        onSuccess: (addedSkill) => {
            // Update the cache with the actual skill returned from the server
            const previous = queryClient.getQueryData<StudentProfile>(PROFILE_QUERY_KEY);
            if (previous) {
                queryClient.setQueryData<StudentProfile>(PROFILE_QUERY_KEY, {
                    ...previous,
                    skills: [...(previous.skills ?? []).filter((s) => !s.id.startsWith("temp-")), addedSkill],
                });
            }
        },

    });

    const updateSkill = useMutation({
        mutationFn: ({ skillId, data }: { skillId: string; data: Partial<Skill> }) =>
            studentService.updateSkill(skillId, data), // This returns the updated skill
        onMutate: async ({ skillId, data }) => {
            await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY });
            const previous = queryClient.getQueryData<StudentProfile>(PROFILE_QUERY_KEY);
            if (previous) {
                queryClient.setQueryData<StudentProfile>(PROFILE_QUERY_KEY, {
                    ...previous,
                    skills: (previous.skills ?? []).map((s) =>
                        s.id === skillId ? { ...s, ...data } : s
                    ),
                });
            }
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(PROFILE_QUERY_KEY, context.previous);
            }
        },
        onSuccess: (updatedSkill) => {
            // Update the cache with the actual updated skill returned from the server
            const previous = queryClient.getQueryData<StudentProfile>(PROFILE_QUERY_KEY);
            if (previous) {
                queryClient.setQueryData<StudentProfile>(PROFILE_QUERY_KEY, {
                    ...previous,
                    skills: (previous.skills ?? []).map((s) =>
                        s.id === updatedSkill.id ? updatedSkill : s
                    ),
                });
            }
        },
    });

    const removeSkill = useMutation({
        mutationFn: (skillId: string) => studentService.removeSkill(skillId),
        onMutate: async (skillId) => {
            await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY });
            const previous = queryClient.getQueryData<StudentProfile>(PROFILE_QUERY_KEY);
            if (previous) {
                queryClient.setQueryData<StudentProfile>(PROFILE_QUERY_KEY, {
                    ...previous,
                    skills: (previous.skills ?? []).filter((s) => s.id !== skillId),
                });
            }
            return { previous };
        },
        onError: (_err, _skillId, context) => {
            if (context?.previous) {
                queryClient.setQueryData(PROFILE_QUERY_KEY, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
        },
    });

    /* ---------- PROJECTS ---------- */
    const addProject = useMutation({
        mutationFn: (data: { name: string; description?: string; liveLink?: string; githubLink?: string }) =>
            studentService.addProject(data),
        onMutate: async (newProject) => {
            await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY });
            const previous = queryClient.getQueryData<StudentProfile>(PROFILE_QUERY_KEY);
            if (previous) {
                const optimisticProject: Project = {
                    id: `temp-${Date.now()}`,
                    name: newProject.name,
                    description: newProject.description || "",
                    liveLink: newProject.liveLink || "",
                    githubLink: newProject.githubLink || "",
                };
                queryClient.setQueryData<StudentProfile>(PROFILE_QUERY_KEY, {
                    ...previous,
                    projects: [...(previous.projects ?? []), optimisticProject],
                });
            }
            return { previous };
        },
        onError: (_err, _newProject, context) => {
            if (context?.previous) {
                queryClient.setQueryData(PROFILE_QUERY_KEY, context.previous);
            }
        },


        onSuccess: (addedProject) => {
            // Update the cache with the actual project returned from the server
            const previous = queryClient.getQueryData<StudentProfile>(PROFILE_QUERY_KEY);
            if (previous) {
                queryClient.setQueryData<StudentProfile>(PROFILE_QUERY_KEY, {
                    ...previous,
                    projects: [...(previous.projects ?? []).filter((p) => !p.id.startsWith("temp-")), addedProject],
                });
            }
        }
    });

    const updateProject = useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: Partial<Project> }) =>
            studentService.updateProject(projectId, data), // This returns the updated project
        onMutate: async ({ projectId, data }) => {
            await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY });
            const previous = queryClient.getQueryData<StudentProfile>(PROFILE_QUERY_KEY);
            if (previous) {
                queryClient.setQueryData<StudentProfile>(PROFILE_QUERY_KEY, {
                    ...previous,
                    projects: (previous.projects ?? []).map((p) =>
                        p.id === projectId ? { ...p, ...data } : p
                    ),
                });
            }
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(PROFILE_QUERY_KEY, context.previous);
            }
        },
        onSuccess: (updatedProject) => {
            // Update the cache with the actual updated project returned from the server
            const previous = queryClient.getQueryData<StudentProfile>(PROFILE_QUERY_KEY);
            if (previous) {
                queryClient.setQueryData<StudentProfile>(PROFILE_QUERY_KEY, {
                    ...previous,
                    projects: (previous.projects ?? []).map((p) =>
                        p.id === updatedProject.id ? updatedProject : p
                    ),
                });
            }
        },
    });

    const removeProject = useMutation({
        mutationFn: (projectId: string) => studentService.removeProject(projectId),
        onMutate: async (projectId) => {
            await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY });
            const previous = queryClient.getQueryData<StudentProfile>(PROFILE_QUERY_KEY);
            if (previous) {
                queryClient.setQueryData<StudentProfile>(PROFILE_QUERY_KEY, {
                    ...previous,
                    projects: (previous.projects ?? []).filter((p) => p.id !== projectId),
                });
            }
            return { previous };
        },
        onError: (_err, _projectId, context) => {
            if (context?.previous) {
                queryClient.setQueryData(PROFILE_QUERY_KEY, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
        },
    });

    return {
        // Profile data
        profile: profileQuery.data,
        isLoading: profileQuery.isLoading,
        isFetching: profileQuery.isFetching,
        error: profileQuery.error,

        // Profile mutations
        updateProfile: updateProfile.mutate,
        updateProfileAsync: updateProfile.mutateAsync,
        isUpdating: updateProfile.isPending,

        // Skill mutations
        addSkill: addSkill.mutate,
        addSkillAsync: addSkill.mutateAsync,
        updateSkill: updateSkill.mutate,
        updateSkillAsync: updateSkill.mutateAsync,
        removeSkill: removeSkill.mutate,
        removeSkillAsync: removeSkill.mutateAsync,
        isAddingSkill: addSkill.isPending,
        isUpdatingSkill: updateSkill.isPending,
        isRemovingSkill: removeSkill.isPending,

        // Project mutations
        addProject: addProject.mutate,
        addProjectAsync: addProject.mutateAsync,
        updateProject: updateProject.mutate,
        updateProjectAsync: updateProject.mutateAsync,
        removeProject: removeProject.mutate,
        removeProjectAsync: removeProject.mutateAsync,
        isAddingProject: addProject.isPending,
        isUpdatingProject: updateProject.isPending,
        isRemovingProject: removeProject.isPending,

        // Refetch
        refetch: profileQuery.refetch,
    };
}
