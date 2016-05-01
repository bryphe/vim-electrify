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

        log.info("--Linecontents: " + eventContext.lineContents);
        log.info("--Col: " + eventContext.col);

        var col = eventContext.col;
        if(col <= 2)
            return;

        var currentCharacter = eventContext.lineContents[col - 2];
        var previousCharacter = eventContext.lineContents[col - 3];
        
        if(currentCharacter == ".") {

            log.info("Trying to open completion menu")
            this._vim.rawExec("extropy#omnicomplete#openCompletionMenu({'base': '" + (col-1).toString() + "', 'completionEntries': ['a', 'b', 'c']})");
        } else if(currentCharacter.match(/[a-z]/i) && previousCharacter == " ") {
            this._vim.rawExec("extropy#omnicomplete#openCompletionMenu({'base': '" + (col-2).toString() + "', 'completionEntries': ['a', 'b', 'c']})");
        }

        // var completers = this._omniCompleters[fileType];

        // if (!completers)
        //     return;

        // completers = completers.filter((completer) => completer.shouldComplete(eventContext));

        // if (completers.length === 0)
        //     return;



        
    }

    public register(fileType: string, omniCompleter: omni.IOmniCompleter): void {
        this._omniCompleters[fileType] = this._omniCompleters[fileType] || [];
        this._omniCompleters[fileType].push(omniCompleter);
    }

    private _startOmniCompletion(omniInfo: any): void {
        // log.verbose("Omnicompletion: starting");
        // var promises = [];

        // this._omniCompleters.forEach((completer) => {
        //     promises.push(completer.getCompletions(omniInfo));
        // });

        // Promise.all(promises).then((ret) => {
        //     var allSuggestions = [];
        //     ret = ret || [];
        //     ret.forEach(r => {
        //         allSuggestions = allSuggestions.concat(r);
        //     });
        //     log.verbose(JSON.stringify(ret));

        //     log.info("Omnicompletion: total values returned: " + allSuggestions.length);

        //     this._rawExec("extropy#omnicomplete#startRemoteCompletion()");
        //     var batchSize = 100;

        //     while (allSuggestions.length > 0) {
        //         var suggestions = allSuggestions.splice(0, batchSize);
        //         this._rawExec("extropy#omnicomplete#addRemoteCompletion('" + JSON.stringify(suggestions) + "')");
        //         log.info("--Sending batch of size: " + suggestions.length);
        //     }

        //     this._rawExec("extropy#omnicomplete#endRemoteCompletion()");
        // });
    }

}
