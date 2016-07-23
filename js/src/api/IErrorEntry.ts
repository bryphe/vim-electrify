/**
 * IErrorEntry is the interface for setting errors
 */
export interface IErrorEntry {
    filename: string,
    lineNumber: number,
    startColumn: number,
    endColumn: number,
    text: string,
    type: string
}
