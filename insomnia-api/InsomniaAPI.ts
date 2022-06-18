import { OpenObject } from "../Utils";

export interface WorkspaceActionContextAppDialogParams {
    tall: boolean;
    wide: boolean;
    skinny: boolean;
}

export interface WorkspaceActionContextApp {
    dialog: (
        title: string,
        element: HTMLElement,
        params: WorkspaceActionContextAppDialogParams
    ) => void | Promise<void>;
}

export interface PluginStore {
    hasItem: (key: string) => Promise<boolean>;
    getItem: (key: string) => Promise<string>;
    setItem: (key: string, value: string) => Promise<void>;
    clear: () => Promise<void>;
    all(): Promise<Array<{ key: string, value: string }>>;
}

export interface WorkspaceActionContext {
    app: WorkspaceActionContextApp;
    store: PluginStore;
}

export interface WorkspaceAction {
    label: string;
    icon: string;
    action: (context: WorkspaceActionContext, data: any) => void | Promise<void>;
}

export interface Environment extends OpenObject {
    getEnvironmentId(): string;
}

export interface RequestContextRequest {
    getEnvironment(): Environment;
}

export interface RequestContext {
    store: PluginStore;
    request: RequestContextRequest;
}

export interface RenderContext {
    store: PluginStore;
    context: Environment;
    renderPurpose: string;
}

export type RequestHook = (context: RequestContext) => void | Promise<void>;