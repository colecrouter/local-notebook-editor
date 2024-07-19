import type { Kernel, LS } from '$lib/kernel/type';
import { writable } from 'svelte/store';
import workerURL from './pythonWorker.ts?url';
import type { EmscriptenFS } from '$lib/fs';
import { loadPyodide } from 'pyodide';
import { refreshFS } from '$lib/kernel/python';

const cachedFiles = writable<LS[]>([]);

export const pythonAsync = async () => {
    const worker = new Worker(workerURL, { type: 'module' });

    // Create an interrupt buffer, so we can interrupt the execution of the code
    const interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));
    worker.postMessage({ cmd: "setInterruptBuffer", interruptBuffer });
    const interruptExecution = () => {
        // 2 stands for SIGINT.
        interruptBuffer[0] = 2;
    };

    // Output store for stdout and stderr
    // TODO something more sophisticated
    // TODO input store for stdin
    const output = writable<string>();

    // Redeclare FS (this will connect to the worker's FS)
    // This is sorta hacky
    const pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/"
    });
    const FS = pyodide.FS as EmscriptenFS;

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
        }).finally(() => {
            refreshFS(FS);
        });
    };

    const refreshFiles = async () => refreshFS(FS);
    const readFile = async (path: string) => FS.readFile(path, { encoding: 'binary' });
    const writeFile = async (path: string, data: Uint8Array) => {
        FS.writeFile(path, data, { encoding: 'binary' });
        await refreshFiles();
    };
    const deleteFile = async (path: string) => {
        FS.unlink(path);
        await refreshFiles();
    };

    // Update the cached files
    await refreshFiles();

    const fs = Object.freeze({ refreshFiles, readFile, writeFile, deleteFile, cachedFiles });

    return Object.freeze({ execute, output, interruptExecution, fs }) satisfies Kernel;
};