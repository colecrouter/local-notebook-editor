import type { EmscriptenFS } from "$lib/fs";
import type { Kernel } from "$lib/kernel/type";
import { loadPyodide } from "pyodide";
import { writable } from "svelte/store";

const pipRegex = /(%|!)(\w+)\s(\w+)\s(.*)/gm;

export const python = async () => {
    const pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/"  // Update to the latest version if needed
    });
    const output = writable<string>("");


    const FS = pyodide.FS as EmscriptenFS;
    FS.mount(pyodide.FS.filesystems.IDBFS, { root: '.' }, "/home/pyodide");
    // FS.chdir("/home/pyodide");
    FS.syncfs(true, (err) => {
        if (err) {
            console.error(err);
        }
    });

    if (!pyodide) return;

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
        }
    };

    return Object.freeze({ execute, output }) as Kernel;
};