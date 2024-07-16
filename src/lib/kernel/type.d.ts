import type { Writable } from "svelte/store";

interface Kernel {
    execute: (code: string) => Promise<string>;
    output: Writable<string>;
}