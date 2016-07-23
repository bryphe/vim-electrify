import * as events from "events";

export class MockPluginHostFactory {
    public createPluginHost(): MockPluginHost {
        return new MockPluginHost();
    }
}

export class MockPluginHost extends events.EventEmitter {

    private _sentCommands = [];

    public start(): void {

    }

    public sendCommand(command: any): void {
        this._sentCommands.push(command);
    }

    public getSentCommands(): any[] {
        return this._sentCommands;
    }

    public showDevTools(): void {

    }

    public hideDevTools(): void {

    }

    public dispose(): void {

    }
}
