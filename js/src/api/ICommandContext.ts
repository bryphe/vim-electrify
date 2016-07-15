/**
 * ICommandContext is the interface for incoming commands.
 * This must be kept in sync with the data comming from context
 * data coming from js.vim
 */
export interface ICommandContext {
    currentBufferNumber: string;
    currentBuffer: number;
    lineContents: string;
    line: number;
    filetype: string;
    col: number;
    byte: number;
}
