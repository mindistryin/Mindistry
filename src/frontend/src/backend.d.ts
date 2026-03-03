import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface StudyMaterial {
    id: string;
    title: string;
    content: string;
    createdAt: bigint;
    tags: Array<string>;
    updatedAt: bigint;
    subjectId?: string;
}
export interface Task {
    id: string;
    title: string;
    createdAt: bigint;
    completed: boolean;
    dueDate: bigint;
    description: string;
    updatedAt: bigint;
    subjectId?: string;
    priority: Priority;
}
export interface FileMeta {
    id: string;
    blob: ExternalBlob;
    fileName: string;
    fileSize: bigint;
    fileType: string;
    subjectId?: string;
    uploadedAt: bigint;
}
export interface Subject {
    id: string;
    name: string;
    createdAt: bigint;
    color: string;
}
export interface UserProfile {
    name: string;
}
export enum Priority {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFile(fileName: string, fileType: string, fileSize: bigint, subjectId: string | null, blob: ExternalBlob): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createMaterial(title: string, content: string, subjectId: string | null, tags: Array<string>): Promise<string>;
    createSubject(name: string, color: string): Promise<string>;
    createTask(title: string, description: string, subjectId: string | null, dueDate: bigint, priority: Priority): Promise<string>;
    deleteFile(id: string): Promise<void>;
    deleteMaterial(id: string): Promise<void>;
    deleteSubject(id: string): Promise<void>;
    deleteTask(id: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFiles(): Promise<Array<FileMeta>>;
    getFilesBySubject(subjectId: string): Promise<Array<FileMeta>>;
    getMaterials(): Promise<Array<StudyMaterial>>;
    getMaterialsBySubject(subjectId: string): Promise<Array<StudyMaterial>>;
    getSubjects(): Promise<Array<Subject>>;
    getTasks(): Promise<Array<Task>>;
    getTasksBySubject(subjectId: string): Promise<Array<Task>>;
    getUpcomingTasks(): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateMaterial(id: string, title: string, content: string, subjectId: string | null, tags: Array<string>): Promise<StudyMaterial>;
    updateSubject(id: string, name: string, color: string): Promise<Subject>;
    updateTask(id: string, title: string, description: string, subjectId: string | null, dueDate: bigint, priority: Priority, completed: boolean): Promise<Task>;
}
