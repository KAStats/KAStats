interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;

    prompt(): Promise<void>;
}

export type Dictionary<T> = { [key: string]: T };

declare global {

    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}
