/* tslint:disable */
/* eslint-disable */

export class Sparkles {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Colors are chosen per star from a stellar palette; `dark_mode` picks
     * between the lit palette and dimmed variants of the same hues. `seed`
     * lays the field out differently on each page load; pass a random value.
     */
    constructor(canvas: HTMLCanvasElement, dark_mode: boolean, seed: number);
    stop(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_sparkles_free: (a: number, b: number) => void;
    readonly sparkles_new: (a: any, b: number, c: number) => [number, number, number];
    readonly sparkles_stop: (a: number) => void;
    readonly wasm_bindgen__convert__closures_____invoke__he1c4d7ec66af6c61: (a: number, b: number, c: number) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h8177f3faa206c380: (a: number, b: number) => void;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_destroy_closure: (a: number, b: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
