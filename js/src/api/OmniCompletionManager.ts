import Promise = require("bluebird");

import * as omni from "./IOmniCompleter";
import * as context from "./ICommandContext";
import Vim from "./index"

declare var log;

export class OmniCompletionManager {

    private _serverName: string;
    private _commandNameToFunction = {};
    private _pluginName: string;

    private _omniCompleters: { [name: string]: omni.IOmniCompleter[]} = {};
    private _vim: Vim;

    constructor(owner: Vim) {
        this._vim = owner;

        this._vim.on("CursorMovedI", (eventContext: context.ICommandContext) => {
            this._checkForCompletion(eventContext);
        });
    }

    private _checkForCompletion(eventContext: context.ICommandContext) {
        console.log("Checking for completion: " + eventContext.filetype);

        var completers = this._omniCompleters[eventContext.filetype];

        if (!completers || !completers.length)
            return;

        // TODO: Handle multiple completers?
        var firstCompleter = completers[0];

        firstCompleter.getCompletions(eventContext)
            .then((completionInfo: omni.ICompletionInfo) => {
                if (completionInfo) {
                    this._sendCompletion(completionInfo);
                    console.log("Received completion results: " + completionInfo.base + "|" + completionInfo.items.length + " items");
                }
            });
    }

    private _sendCompletion(completionInfo: omni.ICompletionInfo | omni.IFunctionCompletionInfo) {
        var serializedCompletion = JSON.stringify(completionInfo);
        this._vim.rawExec("electrify#omnicomplete#initiateCompletion('" + serializedCompletion + "')");
    }

    public register(fileType: string, omniCompleter: omni.IOmniCompleter): void {
        this._omniCompleters[fileType] = this._omniCompleters[fileType] || [];
        this._omniCompleters[fileType].unshift(omniCompleter);
    }
}
