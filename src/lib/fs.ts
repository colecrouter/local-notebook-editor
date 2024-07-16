import { browser } from "$app/environment";
import { writable, type Readable, type Writable } from "svelte/store";

export class VirtualFileSystem {
    protected files: Map<string, string>;
    protected list: Writable<string[]>;

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

export class SessionFileSystem extends VirtualFileSystem {
    constructor() {
        super();

        const data = browser && localStorage.getItem("session");
        if (data) {
            const entries = JSON.parse(data);
            for (const [name, content] of entries) {
                this.addFile(name, content);
            }
        }

        this.list.set([...this.files.keys()]);
        this.list.subscribe(() => this.save());
    }

    save() {
        const data = JSON.stringify([...this.files.entries()]);
        if (browser) localStorage.setItem("session", data);
    }
}

export class IndexedDBFileSystem extends VirtualFileSystem {
    constructor() {
        super();
        this.load();
        this.list.subscribe(() => this.save());
    }

    async save() {
        if (!browser) return;
        const db: IDBDatabase = await new Promise((resolve, reject) => {
            const request = indexedDB.open("notebook", 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains("files")) {
                    db.createObjectStore("files");
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        const transaction = db.transaction("files", "readwrite");
        const store = transaction.objectStore("files");
        store.clear();
        for (const [name, content] of this.files.entries()) {
            store.put(content, name);
        }

        await new Promise((resolve, reject) => {
            transaction.oncomplete = resolve;
            transaction.onerror = reject;
        });
        db.close();
    }

    async load() {
        if (!browser) return;
        const db: IDBDatabase = await new Promise((resolve, reject) => {
            const request = indexedDB.open("notebook", 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains("files")) {
                    db.createObjectStore("files");
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        const transaction = db.transaction("files", "readonly");
        const store = transaction.objectStore("files");
        const cursorRequest = store.openCursor();

        await new Promise((resolve, reject) => {
            cursorRequest.onsuccess = (event) => {
                // @ts-expect-error - TS doesn't know that `event.target` is an IDBRequest
                const cursor = event.target?.result;
                if (cursor) {
                    this.addFile(cursor.key, cursor.value);
                    cursor.continue();
                } else {
                    // No more entries
                    resolve(undefined);
                }
            };
            cursorRequest.onerror = () => reject(cursorRequest.error);
            transaction.oncomplete = resolve;
            transaction.onerror = reject;
        });
        db.close();
    }
}