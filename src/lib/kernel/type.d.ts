import type { Writable } from "svelte/store";

interface Kernel {
    execute: (code: string) => Promise<void>;
    output: Writable<string>;
    interruptExecution?: () => void;
    fs: VFS;
    terminate?: () => void;
}

interface VFS {
    cachedFiles: Writable<LS[]>;
    refreshFiles: () => Promise<LS[]>;
    readFile: (path: string) => Promise<Uint8Array>;
    writeFile: (path: string, data: Uint8Array) => Promise<void>;
    deleteFile: (path: string) => Promise<void>;
}

interface LS {
    name: string;
    path: string;
    dir: boolean;
}