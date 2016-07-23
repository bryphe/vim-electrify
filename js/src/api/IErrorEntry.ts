/**
 * IErrorEntry is the interface for setting errors
 */
export interface IErrorEntry {
    fileName: string,
    lineNumber: number,
    column?: number,
    startColumn?: number,
    endColumn?: number,
    text: string,
    type?: string
}
