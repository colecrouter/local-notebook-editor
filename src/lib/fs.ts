import { loadPyodide } from "pyodide";

export interface EmscriptenFS {
    allocate(stream: EmscriptenStream, offset: number, length: number): void;
    analyzePath(path: string, dontResolveLastLink?: boolean): { object: unknown, name: string, parentExists: boolean, exists: boolean, error: string, path: string; };
    chdir(path: string): void;
    chmod(path: string, mode?: number, dontFollow?: boolean): void;
    chown(path: string, uid: number, gid: number, dontFollow?: boolean): void;
    chrdev_stream_ops: {
        open: (stream: EmscriptenStream) => void;
        llseek: (stream: EmscriptenStream, offset: number, whence: number) => number;
    };
    close(stream: EmscriptenStream): void;
    closeStream(fd: number): void;
    create(path: string, mode?: number): EmscriptenNode;
    createDataFile(
        parent: string,
        name: string,
        data: Uint8Array | string,
        canRead: boolean,
        canWrite: boolean,
        canOwn: boolean
    ): EmscriptenNode;
    createDefaultDevices(): void;
    createDefaultDirectories(): void;
    createDevice(
        parent: string,
        name: string,
        input: () => number,
        output: (c: number) => void
    ): EmscriptenNode;
    createFile(
        parent: string,
        name: string,
        properties: { [key: string]: unknown; },
        canRead: boolean,
        canWrite: boolean
    ): EmscriptenNode;
    createLazyFile(
        parent: string,
        name: string,
        url: string,
        canRead: boolean,
        canWrite: boolean
    ): EmscriptenNode;
    createNode(
        parent: EmscriptenNode,
        name: string,
        mode?: number,
        rdev?: number
    ): EmscriptenNode;
    createPath(
        parent: string,
        path: string,
        canRead: boolean,
        canWrite: boolean
    ): string;
    createPreloadedFile(
        parent: string,
        name: string,
        url: string,
        canRead: boolean,
        canWrite: boolean,
        onload?: () => void,
        onerror?: () => void,
        dontCreateFile?: boolean,
        canOwn?: boolean,
        preFinish?: () => void
    ): void;
    createSpecialDirectories(): void;
    createStandardStreams(): void;
    createStream(stream: EmscriptenStream, fd?: number): EmscriptenStream;
    currentPath: string;
    cwd(): string;
    destroyNode(node: EmscriptenNode): void;
    devices: { [key: number]: unknown; };
    dupStream(origStream: EmscriptenStream, fd?: number): EmscriptenStream;
    fchmod(fd: number, mode?: number): void;
    fchown(fd: number, uid: number, gid: number): void;
    filesystems: { [key: string]: unknown; };
    findObject(path: string, dontResolveLastLink?: boolean): EmscriptenNode;
    flagsToPermissionString(flag: number): string;
    forceLoadFile(obj: EmscriptenNode): void;
    ftruncate(fd: number, len: number): void;
    genericErrors: { [key: number]: unknown; };
    getDevice(dev: number): unknown;
    getMounts(mount: unknown): unknown[];
    getPath(node: EmscriptenNode): string;
    getStream(fd: number): EmscriptenStream;
    getStreamChecked(fd: number): EmscriptenStream;
    hashAddNode(node: EmscriptenNode): void;
    hashName(parentid: number, name: string): number;
    hashRemoveNode(node: EmscriptenNode): void;
    ignorePermissions: boolean;
    init(input: unknown, output: unknown, error: unknown): void;
    initialized: boolean;
    ioctl(stream: EmscriptenStream, cmd: number, arg: unknown): unknown;
    isBlkdev(mode?: number): boolean;
    isChrdev(mode?: number): boolean;
    isClosed(stream: EmscriptenStream): boolean;
    isDir(mode?: number): boolean;
    isFIFO(mode?: number): boolean;
    isFile(mode?: number): boolean;
    isLink(mode?: number): boolean;
    isMountpoint(node: EmscriptenNode): boolean;
    isRoot(node: EmscriptenNode): boolean;
    isSocket(mode?: number): boolean;
    lchmod(path: string, mode?: number): void;
    lchown(path: string, uid: number, gid: number): void;
    llseek(stream: EmscriptenStream, offset: number, whence: number): number;
    lookup(parent: EmscriptenNode, name: string): EmscriptenNode;
    lookupNode(parent: EmscriptenNode, name: string): EmscriptenNode;
    lookupPath(path: string, opts?: { follow_mount?: boolean, recurse_count?: number; }): { path: string, node: EmscriptenNode; };
    lstat(path: string): unknown;
    major(dev: number): number;
    makedev(ma: number, mi: number): number;
    mayCreate(dir: EmscriptenNode, name: string): boolean;
    mayDelete(dir: EmscriptenNode, name: string, isdir: boolean): boolean;
    mayLookup(dir: EmscriptenNode): boolean;
    mayOpen(node: EmscriptenNode, flags: number): boolean;
    minor(dev: number): number;
    mkdev(path: string, mode?: number, dev?: number): void;
    mkdir(path: string, mode?: number): void;
    mkdirTree(path: string, mode?: number): void;
    mknod(path: string, mode?: number, dev?: number): void;
    mmap(
        stream: EmscriptenStream,
        length: number,
        position: number,
        prot: number,
        flags: number
    ): unknown;
    mount(type: unknown, opts: unknown, mountpoint: string): unknown;
    mounts: unknown[];
    msync(
        stream: EmscriptenStream,
        buffer: ArrayBufferView,
        offset: number,
        length: number,
        mmapFlags: number
    ): void;
    nameTable: (EmscriptenNode | undefined)[];
    nextInode: number;
    nextfd(): number;
    nodePermissions(node: EmscriptenNode, perms: string): boolean;
    open(path: string, flags: number, mode?: number): EmscriptenStream;
    quit(): void;
    read(
        stream: EmscriptenStream,
        buffer: ArrayBufferView,
        offset: number,
        length: number,
        position: number
    ): number;
    readFile(path: string, opts?: { flags?: string; }): Uint8Array | string;
    readFile(path: string, opts: { encoding: 'binary'; flags?: string; }): Uint8Array;
    readFile(path: string, opts: { encoding: 'utf8'; flags?: string; }): string;
    readdir(path: string): string[];
    readlink(path: string): string;
    registerDevice(dev: number, ops: unknown): void;
    rename(old_path: string, new_path: string): void;
    rmdir(path: string): void;
    root: EmscriptenNode;
    stat(path: string, dontFollow?: boolean): unknown;
    staticInit(): void;
    streams: EmscriptenStream[];
    symlink(oldpath: string, newpath: string): void;
    syncFSRequests: number;
    syncfs(populate: boolean, callback: (errCode: number) => void): void;
    truncate(path: string, len: number): void;
    unlink(path: string): void;
    unmount(mountpoint: string): void;
    utime(path: string, atime: number, mtime: number): void;
    write(
        stream: EmscriptenStream,
        buffer: ArrayBufferView,
        offset: number,
        length: number,
        position: number,
        canOwn: boolean
    ): number;
    writeFile(path: string, data: Uint8Array | string, opts?: { encoding?: string, flags?: string; }): void;
}

interface EmscriptenNode {
    name: string;
    mode?: number;
    parent: EmscriptenNode;
    mount: unknown;
    mounted: unknown;
    id: number;
    rdev: number;
    contents?: Uint8Array | string | unknown;
    usedBytes?: number;
    timestamp: number;
    stream_ops?: unknown;
    node_ops?: {
        getattr?: (node: EmscriptenNode) => unknown;
        setattr?: (node: EmscriptenNode, attr: unknown) => void;
        lookup?: (parent: EmscriptenNode, name: string) => EmscriptenNode;
        mknod?: (parent: EmscriptenNode, name: string, mode?: number, dev?: number) => EmscriptenNode;
        rename?: (oldNode: EmscriptenNode, newDir: EmscriptenNode, newName: string) => void;
        unlink?: (parent: EmscriptenNode, name: string) => void;
        rmdir?: (parent: EmscriptenNode, name: string) => void;
        readdir?: (node: EmscriptenNode) => string[];
        symlink?: (parent: EmscriptenNode, newName: string, oldPath: string) => void;
        readlink?: (node: EmscriptenNode) => string;
        // Add other node operations as needed
    };
    // Add other properties as needed
}

interface EmscriptenStream {
    node: EmscriptenNode;
    flags: number;
    position: number;
    stream_ops: {
        read: (stream: EmscriptenStream, buffer: ArrayBufferView, offset: number, length: number, position: number) => number;
        write: (stream: EmscriptenStream, buffer: ArrayBufferView, offset: number, length: number, position: number, canOwn: boolean) => number;
        llseek: (stream: EmscriptenStream, offset: number, whence: number) => number;
        close: (stream: EmscriptenStream) => void;
        // Add other stream operations as needed
    };
    ungotten: number[];
    error: boolean;
    // Add other properties as needed
}

export const indexedDBFS = async () => {
    const pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/"
    });
    const FS = pyodide.FS as EmscriptenFS;
    // FS.mkdir("/assets");
    FS.mount(pyodide.FS.filesystems.IDBFS, { root: '.' }, "/home/pyodide");
    FS.chdir("/home/pyodide");
    return FS;
};