import type { CodeOutput } from "$lib/notebook";

export const formatNotebookOutput = (output: CodeOutput[]): string => {
    return output.map((o) => {
        switch (o.output_type) {
            case "stream":
                return o.text;
            case "error":
                return `${o.ename}: ${o.evalue}`;
            case "display_data":
            case "execute_result":
                if (o.data["text/plain"]) {
                    return `<pre>${o.data["text/plain"]}</pre>`;
                } else if (o.data["image/png"]) {
                    return `<img src="data:image/png;base64,${o.data["image/png"]}" />`;
                }
                return "";
            default:
                return "";
        }
    }).flat().join("");
};