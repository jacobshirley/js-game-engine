class DebugOutput {
    constructor() {
        this.lines = [];
    }

    addLine(string, severity) {
        this.lines.push({message: string, severity});
    }

    print() {

    }
}
