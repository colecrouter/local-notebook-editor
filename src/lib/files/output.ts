import type { CodeOutput } from "$lib/notebook";

export const formatNotebookOutput = (output: CodeOutput[]): string => {
    return output.map((o) => {
        switch (o.output_type) {
            case "stream":
                return `<pre>${Array.isArray(o.text) ? o.text.join("") : o.text}</pre>`;
            case "error":
                return `<pre>${o.ename}: ${o.evalue}</pre>`;
            case "display_data":
            case "execute_result":
                if (o.data["text/plain"]) {
                    return `<pre>${o.data["text/plain"]}</pre>`;
                } else if (o.data["text/html"]) {
                    // Extract any script tags and execute them
                    const text = Array.isArray(o.data["text/html"]) ? o.data["text/html"].join("") : o.data["text/html"];
                    // const html = new DOMParser().parseFromString(text, "text/html");

                    // const scripts = html.querySelectorAll("script");
                    // setTimeout(() => {
                    //     for (const script of scripts) {
                    //         const newScript = document.createElement("script");
                    //         newScript.text = script.text;
                    //         document.body.appendChild(newScript);
                    //     }
                    // }, 0);
                    return text;
                } else if (o.data["image/png"]) {
                    return `<img src="data:image/png;base64,${o.data["image/png"]}" />`;
                }
                return "";
            default:
                return "";
        }
    }).flat().join("");
};