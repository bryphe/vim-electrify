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
        })
    }

    private _checkForCompletion(eventContext: context.ICommandContext) {
        log.info("Checking for completion: " + eventContext.filetype);

        var completers = this._omniCompleters[eventContext.filetype];

        if (!completers || !completers.length)
            return;

        log.info("Got a completer");
        // TODO: Handle multiple completers?
        var firstCompleter = completers[0];

        // var completionType = <omni.CompletionType>firstCompleter.getCompletionType(eventContext);

        // if (completionType == omni.CompletionType.None) {
        //     log.info("CompletionType: None");
        // } else if (completionType === omni.CompletionType.Omni) {
        //     log.info("CompletionType: Omni");
            firstCompleter.getCompletions(eventContext)
                .then((completionInfo: omni.ICompletionInfo) => {
                    if (completionInfo) {
                        this._sendCompletion(completionInfo);
                        log.info("Received completion results: " + completionInfo.base + "|" + completionInfo.items.length + " items");
                    }
                });
        // } else if(completionType === omni.CompletionType.Function) {
        //     log.info("CompletionType: Function");

        //     firstCompleter.getFunctionCompletions(eventContext)
        //         .then((completionInfo: omni.IFunctionCompletionInfo) => {
        //             if(completionInfo) {
        //                 this._sendCompletion(completionInfo);
        //                 log.info("Received function completion results");
        //             }
        //         });
        // }
    }

    private _sendCompletion(completionInfo: omni.ICompletionInfo | omni.IFunctionCompletionInfo) {
        var serializedCompletion = JSON.stringify(completionInfo);
        this._vim.rawExec("extropy#omnicomplete#initiateCompletion('" + serializedCompletion + "')");
    }

    private _isFunctionMeet(eventContext: context.ICommandContext) {

    }

    public register(fileType: string, omniCompleter: omni.IOmniCompleter): void {
        this._omniCompleters[fileType] = this._omniCompleters[fileType] || [];
        this._omniCompleters[fileType].push(omniCompleter);
    }
}
