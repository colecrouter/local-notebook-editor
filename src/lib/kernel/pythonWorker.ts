import type { EmscriptenFS } from "$lib/fs";
import { pipRegex } from "$lib/kernel/python";
import { loadPyodide, type PyodideInterface } from "pyodide";

console.log("Worker loaded");

const pyodideReadyPromise = loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/"
});

pyodideReadyPromise.then(async (pyodide) => {
    const FS = pyodide.FS as EmscriptenFS;
    FS.mount(pyodide.FS.filesystems.IDBFS, { root: '.' }, "/home/pyodide");
    FS.chdir("/home/pyodide");
    await new Promise((resolve, reject) => FS.syncfs(true, (err) => {
        if (err) reject(err);
        else resolve(undefined);
    }));
});


self.onmessage = async (event) => {
    const pyodide = await pyodideReadyPromise;
    console.log(event.data);

    const { code, cmd } = event.data;

    switch (cmd) {
        case "execute":
            pyodide.setStdout({
                write: (buffer: Uint8Array) => {
                    const text = new TextDecoder().decode(buffer);
                    self.postMessage({ text });
                    return buffer.length;
                }
            });

            pyodide.setStderr({
                write: (buffer: Uint8Array) => {
                    const text = new TextDecoder().decode(buffer);
                    self.postMessage({ text });
                    return buffer.length;
                }
            });

            try {
                // Handle Python package installations or other pre-processing
                const modifiedCode = await preprocessCode(code, pyodide);

                // Execute the Python code
                await pyodide.runPythonAsync(modifiedCode);
            } catch (error) {
                // Send error information back to the main thread
                self.postMessage({ error: (error as Error).message });
            } finally {
                // Send unique message to indicate the end of the execution
                self.postMessage({ result: true });
            }
            break;
        case "setInterruptBuffer":
            pyodide.setInterruptBuffer(event.data.interruptBuffer);
            break;
        // case "readdir":
        //     {
        //         const files = pyodide.FS.readdir(event.data.path);
        //         self.postMessage({ result: files });
        //         break;
        //     }
        // case "readFile":
        //     {
        //         const data = pyodide.FS.readFile(event.data.path);
        //         self.postMessage({ result: data });
        //         break;
        //     }
        // case "writeFile":
        //     {
        //         pyodide.FS.writeFile(event.data.path, event.data.data);
        //         self.postMessage({ result: true });
        //         break;
        //     }
        // case "deleteFile":
        //     {
        //         pyodide.FS.unlink(event.data.path);
        //         self.postMessage({ result: true });
        //         break;
        //     }
        default:
            throw new Error(`Unknown command: ${cmd}`);
    }
};

async function preprocessCode(code: string, pyodide: PyodideInterface) {
    let modifiedCode = code;

    let match;
    while ((match = pipRegex.exec(code)) !== null) {
        const [, , command, , packageName] = match;
        if (command === "pip") {
            // Handle pip commands separately
            await installPackage(packageName, pyodide);
            modifiedCode = modifiedCode.replace(match[0], ""); // Remove the pip command from the code
        }
    }

    return modifiedCode;
}

async function installPackage(packageName: string, pyodide: PyodideInterface) {
    try {
        console.log(`Installing package ${packageName}`);
        await pyodide.loadPackage('micropip');
        const micropip = pyodide.pyimport("micropip");
        await micropip.install(packageName);
    } catch (error) {
        console.error(`Failed to install package ${packageName}: ${error}`);
        throw error;
    }
}

// async function refreshFS(fs: EmscriptenFS, write = false) {
//     // First sync the filesystem to the IDBFS
//     if (write) {
//         await new Promise((resolve, reject) => fs.syncfs(false, (err) => {
//             if (err) reject(err);
//             else resolve(undefined);
//         }));
//     }

//     // Then sync the IDBFS to the filesystem
//     await new Promise((resolve, reject) => fs.syncfs(true, (err) => {
//         if (err) reject(err);
//         else resolve(undefined);
//     }));
// }