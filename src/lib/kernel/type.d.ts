import type { Writable } from "svelte/store";

interface Kernel {
    execute: (code: string) => Promise<void>;
    output: Writable<string>;
}