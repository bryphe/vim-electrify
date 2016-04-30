import Promise = require("bluebird");
export interface ICompletionInfo {
    word: string;
}

export interface IOmniCompleter {
    getCompletions(context: any): Promise<ICompletionInfo[]>
}
