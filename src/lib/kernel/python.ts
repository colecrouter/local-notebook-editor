import { loadPyodide } from "pyodide";
import { writable } from "svelte/store";

const pipRegex = /(%|!)(\w+)\s(\w+)\s(.*)/g;

export const python = async () => {
    const pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/"  // Update to the latest version if needed
    });
    const output = writable<string>("");

    const setupOutputRedirection = () => {
        if (!pyodide) return;

        pyodide.setStdout({
            write: (buffer: Uint8Array) => {
                const text = new TextDecoder().decode(buffer);
                output.update(current => current + text);
                console.log(text);
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
    };

    setupOutputRedirection();

    const execute = async (code: string) => {
        // Remove all % and ! magics, if it's pip install, then install the package
        const matches = code.match(pipRegex);
        if (matches) {
            for (const match of matches) {
                console.log(match);
                const [, magic, command, , name] = pipRegex.exec(match) ?? ['', '', '', '', ''];
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
            const text = await pyodide.runPythonAsync(code);

            output.update(current => current + text);
        } catch (error) {
            output.update(current => current + error);
        }
    };

    return Object.freeze({ execute, output });
};