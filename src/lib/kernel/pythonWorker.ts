import { loadPyodide, type PyodideInterface } from "pyodide";


const pyodideReadyPromise = loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/"
});

self.onmessage = async (event) => {
    // Ensure Pyodide is fully loaded
    const pyodide = await pyodideReadyPromise;

    const { code } = event.data;

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

        // Send unique message to indicate the end of the execution
        self.postMessage({ result: true });
    } catch (error) {
        // Send error information back to the main thread
        self.postMessage({ error: (error as Error).message });
    }
};

async function preprocessCode(code: string, pyodide: PyodideInterface) {
    const pipRegex = /(%|!)(pip)\s(\w+)\s(.*)/gm;
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