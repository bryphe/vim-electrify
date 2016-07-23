/**
 * ILocListEntry is the interface for interacting with the vim loclist
 */
export interface ILocListEntry {
    fileName: string,
    lineNumber: number,
    column: number,
    text: string,
    type: string
}
