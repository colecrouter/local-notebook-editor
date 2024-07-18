export interface Notebook {
    metadata: {
        kernelspec?: {
            name: string;
        };
        language_info?: {
            name: string;
            version?: string;
            codemirror_mode?: string;
        };
    };
    nbformat: number;
    nbformat_minor: number;
    cells: Cell[];
}

export type Cell = CodeCell | MarkdownCell | RawCell;

interface CodeCell {
    cell_type: 'code';
    execution_count: number;
    metadata: {
        collapsed: boolean;
        scrolled: boolean;
    };
    source: string | string[];
    outputs: CodeOutput[];
}

export type CodeOutput = ExecuteResult | DisplayData | StreamOutput | ErrorOutput;

interface StreamOutput {
    output_type: 'stream';
    name: "stdout" | "stderr";
    text: string | string[];
}

interface ErrorOutput {
    output_type: 'error';
    ename: string;
    evalue: string;
    traceback: string[];
}

interface DisplayData {
    output_type: 'display_data';
    data: {
        "text/plain"?: string;
        "image/png"?: string;
        "application/json"?: Record<string, unknown>;
        "text/html"?: string | string[];
    };
    metadata: Record<string, unknown>;
}

interface ExecuteResult {
    output_type: 'execute_result';
    data: {
        "text/plain"?: string;
        "image/png"?: string;
        "application/json"?: Record<string, unknown>;
        "text/html"?: string;
    };
    metadata: Record<string, unknown>;
    execution_count: number;
}

interface MarkdownCell {
    cell_type: 'markdown';
    source: string | string[];
}

interface RawCell {
    cell_type: 'raw';
    metadata: {
        format: string;
    };
    source: string;
}