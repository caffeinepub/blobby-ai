import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ChatSession, UserProfile } from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
    const { actor, isFetching: actorFetching } = useActor();

    const query = useQuery<UserProfile | null>({
        queryKey: ['currentUserProfile'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getCallerUserProfile();
        },
        enabled: !!actor && !actorFetching,
        retry: false,
    });

    return {
        ...query,
        isLoading: actorFetching || query.isLoading,
        isFetched: !!actor && query.isFetched,
    };
}

export function useSaveCallerUserProfile() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (profile: UserProfile) => {
            if (!actor) throw new Error('Actor not available');
            return actor.saveCallerUserProfile(profile);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        },
    });
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export function useListSessions() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<ChatSession[]>({
        queryKey: ['sessions'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.listSessions();
        },
        enabled: !!actor && !actorFetching,
    });
}

export function useGetSession(sessionId: string | null) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<ChatSession | null>({
        queryKey: ['session', sessionId],
        queryFn: async () => {
            if (!actor || !sessionId) return null;
            return actor.getSession(sessionId);
        },
        enabled: !!actor && !actorFetching && !!sessionId,
    });
}

export function useCreateSession() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, taskType }: { id: string; taskType: string }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.createSession(id, taskType);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        },
    });
}

export function useSaveMessage() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            sessionId,
            role,
            content,
        }: {
            sessionId: string;
            role: string;
            content: string;
        }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.saveMessage(sessionId, role, content);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['session', variables.sessionId] });
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        },
    });
}

export function useDeleteSession() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (sessionId: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.deleteSession(sessionId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        },
    });
}
