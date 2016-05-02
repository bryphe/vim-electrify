import Promise = require("bluebird");

import * as omni from "./IOmniCompleter";
import * as context from "./ICommandContext";
import Vim from "./index"

declare var log;

export class OmniCompletionManager {

    private _serverName: string;
    private _commandNameToFunction = {};
    private _pluginName: string;

    private _omniCompleters = {};
    private _vim: Vim;

    constructor(owner: Vim) {
        this._vim = owner;


        this._vim.on("CursorMovedI", (eventContext: context.ICommandContext) => {
            this._checkForCompletion(eventContext);
        })
    }

    private _checkForCompletion(eventContext: context.ICommandContext) {
        log.info("Checking for completion: " + eventContext.filetype);


        // var line = eventContext.line;
        // var column = eventContext.col;
        // var posi
        // abc...
        // abc.c c

        var completers = this._omniCompleters[eventContext.filetype];

        if (!completers)
            return;

        completers = completers.filter((completer) => completer.shouldComplete(eventContext));

        if (completers.length === 0)
            return;

        log.info("Got a completer");
        // TODO: Handle multiple completers?
        var firstCompleter = completers[0];

        firstCompleter.getCompletions(eventContext)
            .then((completionInfo: omni.ICompletionInfo) => {
                if (completionInfo) {
                    this._sendCompletion(completionInfo);
                    log.info("Received completion results: " + completionInfo.base + "|" + completionInfo.items.length + " items");
                }
            });
    }

    private _sendCompletion(completionInfo: omni.ICompletionInfo) {
        var serializedCompletion = JSON.stringify(completionInfo);
        this._vim.rawExec("extropy#omnicomplete#initiateCompletion('" + serializedCompletion + "')");
    }

    public register(fileType: string, omniCompleter: omni.IOmniCompleter): void {
        this._omniCompleters[fileType] = this._omniCompleters[fileType] || [];
        this._omniCompleters[fileType].push(omniCompleter);
    }
}
