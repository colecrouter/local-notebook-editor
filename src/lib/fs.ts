import { writable, type Readable, type Writable } from "svelte/store";

export class VirtualFileSystem {
    private files: Map<string, string>;
    private list: Writable<string[]>;

    constructor() {
        this.files = new Map();
        this.list = writable([]);
    }

    addFile(name: string, content: string) {
        this.files.set(name, content);
        this.list.set([...this.files.keys()]);
    }

    readFile(name: string) {
        return this.files.get(name);
    }

    deleteFile(name: string) {
        this.files.delete(name);
        this.list.set([...this.files.keys()]);
    }

    get filesList() {
        return this.list as Readable<string[]>;
    }
}