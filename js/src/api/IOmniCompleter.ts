import Promise = require("bluebird");
import context = require("./ICommandContext")

export interface ICompletionInfo {
    base: number;
    line: number;
    items: ICompletionItem[];
}
export interface ICompletionItem {
    word: string;
    menu?: string;
    kind?: string;
}

export interface IFunctionCompletionInfo {
    base: number;
    line: number;
    items: IFunctionCompletionItem[];
}

export interface IFunctionCompletionItem {
    snippet: string;
    kind?: string;
}

export interface IOmniCompleter {
    getCompletions(completionContext: context.ICommandContext): Promise<ICompletionInfo>;
}
