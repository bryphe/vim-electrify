"use strict";
class OmniCompletionManager {
    constructor(owner) {
        this._commandNameToFunction = {};
        this._omniCompleters = {};
        this._vim = owner;
        this._vim.on("CursorMovedI", (eventContext) => {
            this._checkForCompletion(eventContext);
        });
    }
    _checkForCompletion(eventContext) {
        console.log("Checking for completion: " + eventContext.filetype);
        var completers = this._omniCompleters[eventContext.filetype];
        if (!completers || !completers.length)
            return;
        console.log("Got a completer");
        var firstCompleter = completers[0];
        firstCompleter.getCompletions(eventContext)
            .then((completionInfo) => {
            if (completionInfo) {
                this._sendCompletion(completionInfo);
                console.log("Received completion results: " + completionInfo.base + "|" + completionInfo.items.length + " items");
            }
        });
    }
    _sendCompletion(completionInfo) {
        var serializedCompletion = JSON.stringify(completionInfo);
        this._vim.rawExec("electrify#omnicomplete#initiateCompletion('" + serializedCompletion + "')");
    }
    _isFunctionMeet(eventContext) {
    }
    register(fileType, omniCompleter) {
        this._omniCompleters[fileType] = this._omniCompleters[fileType] || [];
        this._omniCompleters[fileType].unshift(omniCompleter);
    }
}
exports.OmniCompletionManager = OmniCompletionManager;
