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