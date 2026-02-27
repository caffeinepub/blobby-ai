import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    content: string;
    role: string;
    timestamp: bigint;
}
export interface UserProfile {
    name: string;
}
export interface ChatSession {
    id: string;
    messages: Array<Message>;
    owner: Principal;
    taskType: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createSession(id: string, taskType: string): Promise<void>;
    deleteSession(id: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getSession(id: string): Promise<ChatSession>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listSessions(): Promise<Array<ChatSession>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveMessage(sessionId: string, role: string, content: string): Promise<void>;
}
