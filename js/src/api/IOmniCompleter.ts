import Promise = require("bluebird");
import context = require("./ICommandContext")

export interface ICompletionInfo {
    word: string;
    menu: string;
    kind: string;
}

export interface IOmniCompleter {
    shouldComplete(completionContext: context.ICommandContext): boolean;
    getCompletions(completionContext: context.ICommandContext): Promise<ICompletionInfo[]>
}
