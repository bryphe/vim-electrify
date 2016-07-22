"use strict";
var OmniCompletionManager = (function () {
    function OmniCompletionManager(owner) {
        var _this = this;
        this._commandNameToFunction = {};
        this._omniCompleters = {};
        this._vim = owner;
        this._vim.on("CursorMovedI", function (eventContext) {
            _this._checkForCompletion(eventContext);
        });
    }
    OmniCompletionManager.prototype._checkForCompletion = function (eventContext) {
        var _this = this;
        console.log("Checking for completion: " + eventContext.filetype);
        var completers = this._omniCompleters[eventContext.filetype];
        if (!completers || !completers.length)
            return;
        console.log("Got a completer");
        var firstCompleter = completers[0];
        firstCompleter.getCompletions(eventContext)
            .then(function (completionInfo) {
            if (completionInfo) {
                _this._sendCompletion(completionInfo);
                console.log("Received completion results: " + completionInfo.base + "|" + completionInfo.items.length + " items");
            }
        });
    };
    OmniCompletionManager.prototype._sendCompletion = function (completionInfo) {
        var serializedCompletion = JSON.stringify(completionInfo);
        this._vim.rawExec("electrify#omnicomplete#initiateCompletion('" + serializedCompletion + "')");
    };
    OmniCompletionManager.prototype._isFunctionMeet = function (eventContext) {
    };
    OmniCompletionManager.prototype.register = function (fileType, omniCompleter) {
        this._omniCompleters[fileType] = this._omniCompleters[fileType] || [];
        this._omniCompleters[fileType].unshift(omniCompleter);
    };
    return OmniCompletionManager;
}());
exports.OmniCompletionManager = OmniCompletionManager;
