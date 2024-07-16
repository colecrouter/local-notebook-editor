

async function loadPyodideAndRun() {
    self.pyodide = await loadPyodide();
}

let pythonRunner = async (code) => {
    try {
        await self.pyodide.loadPackage(['numpy']); // Load any packages you need
        let results = await self.pyodide.runPythonAsync(code);
        self.postMessage({ status: 'success', results });
    } catch (error) {
        self.postMessage({ status: 'error', error: error.message });
    }
};

self.onmessage = async (event) => {
    if (event.data.type === 'initialize') {
        await loadPyodideAndRun();
    } else if (event.data.type === 'execute') {
        await pythonRunner(event.data.code);
    }
};