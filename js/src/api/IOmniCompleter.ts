export interface ICompletionInfo {
    word: string;
}

export interface IOmniCompleter {
    getCompletions(context: any): ICompletionInfo[]
    onFileUpdate(fileName: string, newContents: string): void;
}
