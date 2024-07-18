import type { Kernel } from '$lib/kernel/type';
import { writable } from 'svelte/store';
import workerURL from './pythonWorker.ts?url';

export const pythonAsync = async () => {
    const worker = new Worker(workerURL, { type: 'module' });

    const interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));
    worker.postMessage({ cmd: "setInterruptBuffer", interruptBuffer });
    const interruptExecution = () => {
        // 2 stands for SIGINT.
        interruptBuffer[0] = 2;
    };

    const output = writable();

    const execute = async (code: string) => {
        // Reset the interrupt buffer
        interruptBuffer[0] = 0;

        // Send the code to the worker
        worker.postMessage({ code, cmd: "execute" });
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

    return Object.freeze({ execute, output, interruptExecution }) as Kernel;
};