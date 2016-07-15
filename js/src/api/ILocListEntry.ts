/**
 * ILocListEntry is the interface for interacting with the vim loclist
 */
export interface ILocListEntry {
    bufnr: number,
    lnum: number,
    col: number,
    text: string,
    nr: number,
    type: string
}
