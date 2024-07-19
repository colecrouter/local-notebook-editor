import type { EmscriptenFS } from "$lib/fs";
import type { Kernel, LS } from "$lib/kernel/type";
import { loadPyodide } from "pyodide";
import { writable } from "svelte/store";

export const pipRegex = /(%|!)(\w+)\s(\w+)\s(.*)/gm;

const cachedFiles = writable<LS[]>([]);

export const python = async () => {
    const pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/"  // Update to the latest version if needed
    });
    const output = writable<string>("");


    const FS = pyodide.FS as EmscriptenFS;
    FS.mount(pyodide.FS.filesystems.IDBFS, { root: '.' }, "/home/pyodide");
    FS.chdir("/home/pyodide");
    await new Promise((resolve, reject) => FS.syncfs(true, (err) => {
        if (err) reject(err);
        else resolve(undefined);
    }));

    console.log(FS.readdir("/home/pyodide"));

    pyodide.setStdout({
        write: (buffer: Uint8Array) => {
            const text = new TextDecoder().decode(buffer);
            output.update(current => current + text);
            return buffer.length;
        }
    });

    pyodide.setStderr({
        write: (buffer: Uint8Array) => {
            const text = new TextDecoder().decode(buffer);
            output.update(current => current + text);
            return buffer.length;
        }
    });

    const execute = async (code: string) => {
        // Remove all % and ! magics, if it's pip install, then install the package

        const results = new Array<RegExpExecArray>();
        let match: RegExpExecArray | null;
        while ((match = pipRegex.exec(code)) !== null) {
            results.push(match);
        }

        if (results) {
            for (const match of results) {
                const [, magic, command, , name] = match ?? Array(5).fill('');
                if (magic === "%") {
                    if (command === "pip") {
                        try {
                            await pyodide.loadPackage('micropip');
                            const micropip = pyodide.pyimport("micropip");
                            await micropip.install(name);
                        } catch (error) {
                            return output.update(current => current + error);
                        }
                    }
                }
            }
        }

        code = code.replaceAll(pipRegex, "");

        try {
            await pyodide.runPythonAsync(code);
        } catch (error) {
            output.update(current => current + error);
        } finally {
            refreshFS(FS);
        }
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

    return Object.freeze({ execute, output, fs }) satisfies Kernel;
};

// Read the filesystem and cache all files
export const refreshFS = async (fs: EmscriptenFS): Promise<LS[]> => {
    // Update first
    await new Promise((resolve, reject) => fs.syncfs(false, (err) => {
        if (err) reject(err);
        else resolve(undefined);
    }));
    await new Promise((resolve, reject) => fs.syncfs(true, (err) => {
        if (err) reject(err);
        else resolve(undefined);
    }));

    const path = '/home/pyodide';
    const files = fs.readdir(path);
    const cached: Array<LS> = [];
    // Need to go into each directory
    for (const path of files) {
        const stat = fs.stat(path);
        if (stat.mode ^ 0x4000) {
            const files = fs.readdir(path)
                .filter((file) => ['.', '..'].indexOf(file) === -1);
            for (const file of files) {
                cached.push({ name: file, path: `${path}/${file}`, dir: false });
            }
        } else {
            cached.push({ name: path, path, dir: false });
        }
    }

    cachedFiles.set(cached);

    return cached;
};