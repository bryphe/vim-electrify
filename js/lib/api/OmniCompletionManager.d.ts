import * as omni from "./IOmniCompleter";
import Vim from "./index";
export declare class OmniCompletionManager {
    private _serverName;
    private _commandNameToFunction;
    private _pluginName;
    private _omniCompleters;
    private _vim;
    constructor(owner: Vim);
    private _checkForCompletion(eventContext);
    private _sendCompletion(completionInfo);
    register(fileType: string, omniCompleter: omni.IOmniCompleter): void;
}
