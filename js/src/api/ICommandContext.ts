export interface ICommandContext {
    currentBufferNumber: string;
    currentBuffer: number;
    lineContents: string;
    line: number;
    filetype: string;
    col: number;
    byte: number;
}
