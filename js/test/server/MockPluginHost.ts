import * as events from "events";

export class MockPluginHostFactory {
    public createPluginHost(): MockPluginHost {
        return new MockPluginHost();
    }
}

export class MockPluginHost extends events.EventEmitter {

    public start(): void {

    }

    public sendCommand(): void {

    }

    public showDevTools(): void {

    }

    public hideDevTools(): void {

    }

    public dispose(): void {

    }
}
