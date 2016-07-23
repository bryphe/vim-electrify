export class MockCommandExecutor {

    public executeCommand(): Promise<void> {
        return Promise.resolve();
    }
}
