import { createInterface, ReadLine } from "readline";
import { spawn, ChildProcess } from "child_process";
import * as test from 'http';
import { join } from "path";
import { EventEmitter } from "events";

interface TSClientOptions {
    cwd?: string;
}

export default class TSClient extends EventEmitter {
    private _callbacks: ((data) => void)[] = [];
    private _seq = -1;
    private _interface: ReadLine;
    private _proc: ChildProcess;

    constructor(private options: TSClientOptions) {
        super();
        this._proc = spawn(join(__dirname, "../node_modules/.bin/tsserver"), [], {
            cwd: options.cwd
        });

        this._interface = createInterface(this._proc.stdout, this._proc.stdin);

        this._interface.on('line', (data) => {
            if (data && data[0] !== "C") {
                var res = JSON.parse(data);
                if (res.type == "response") {
                    // console.log(res);
                    this._callbacks[res.request_seq] ? this._callbacks[res.request_seq](res) : console.log(res);
                } else if (res.type == "event") {
                    this.emit(res.event, res.body);
                }
            }
        });
        // this._sendMessage("configure", {
        //     preferences: {
        //         includeCompletionsForModuleExports: true
        //     }
        // })
    }
    private _sendMessage(command, args, cb?) {
        var cmd = {
            type: "request",
            command,
            seq: cb ? ++this._seq : 0,
            arguments: args
        }
        if (cb) {
            this._callbacks.push((data) => {
                delete this._callbacks[this._seq];
                cb(data);
            })
        }
        this._proc.stdin.write(JSON.stringify(cmd) + "\n");
    }
    open(filename) {
        this._sendMessage("open", {
            file: filename
        });
    }

    change(filename, fromLine, fromOffset, toLine, toOffset, text) {
        this._sendMessage("change", {
            file: filename,
            line: fromLine,
            offset: fromOffset,
            endLine: toLine,
            endOffset: toOffset,
            insertString: text
        });
    }

    async getCompletions(file: string, line: number, offset: number, prefix?: string) {
        return new Promise(resolve => {
            this._sendMessage("completions", {
                file,
                line,
                offset,
                prefix,
                "includeExternalModuleExports": true,
                "includeInsertTextCompletions": true
            }, resolve);
        });
    }
    async getCompletionEntryDetails(file, line, offset, entryNames) {
        return new Promise(resolve => {
            this._sendMessage("completionEntryDetails", {
                file,
                line,
                offset,
                entryNames
            }, resolve)
        })
    }

    async getDefinition(file, line, offset) {
        return new Promise(resolve => {
            this._sendMessage("definition", {
                file,
                line,
                offset
            }, resolve)
        });
    }
    getErr(filename) {
        this._sendMessage("geterr", {
            delay: 0,
            files: [filename]
        })
    }

    close() {
        this._proc.kill();
    }
}