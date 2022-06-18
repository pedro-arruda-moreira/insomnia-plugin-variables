export interface VarHandler {
    canSave(name: string, value: string): Promise<boolean>;
    save(name: string, value: string): Promise<void>;
    read(context: any, name: string): Promise<string | null>;
}