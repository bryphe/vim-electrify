export interface ICompletionInfo {
    word: string;
}

export interface IOmniCompleter {
    getCompletions(context: any): ICompletionInfo[]
}
