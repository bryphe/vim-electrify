/**
 * ILocListEntry is the interface for interacting with the vim loclist
 */
export interface ILocListEntry {
    filename: string,
    lineNumber: number,
    column: number,
    text: string,
    type: string
}
