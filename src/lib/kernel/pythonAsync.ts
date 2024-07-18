import type { Kernel } from '$lib/kernel/type';
import { writable } from 'svelte/store';
import workerURL from './pythonWorker.ts?url';

export const pythonAsync = async () => {
    const worker = new Worker(workerURL, { type: 'module' });
    const output = writable("");

    const execute = async (code: string) => {
        worker.postMessage({ code });
        await new Promise(resolve => {
            worker.onmessage = (event) => {
                if (event.data.error) {
                    output.update(current => current + event.data.error);
                }
                if (event.data.text) {
                    output.update(current => current + event.data.text);
                }
                if (event.data.result) {
                    resolve(event.data.result);
                }
            };
        });
    };

    return Object.freeze({ execute, output }) as Kernel;
};