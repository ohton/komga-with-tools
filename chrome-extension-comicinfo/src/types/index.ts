export type PopupState = {
    isOpen: boolean;
    message: string;
};


export type BackgroundEvent = {
    type: string;
    payload?: unknown;
};


export type ContentScriptMessage = {
    action: string;
    data?: unknown;
};