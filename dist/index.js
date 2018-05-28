"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var readline_1 = require("readline");
var child_process_1 = require("child_process");
var path_1 = require("path");
var events_1 = require("events");
var TSClient = /** @class */ (function (_super) {
    __extends(TSClient, _super);
    function TSClient(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        _this._callbacks = [];
        _this._seq = -1;
        _this._proc = child_process_1.spawn(path_1.join(__dirname, "../node_modules/.bin/tsserver"), [], {
            cwd: options.cwd
        });
        _this._interface = readline_1.createInterface(_this._proc.stdout, _this._proc.stdin);
        _this._interface.on('line', function (data) {
            if (data && data[0] !== "C") {
                var res = JSON.parse(data);
                if (res.type == "response") {
                    // console.log(res);
                    _this._callbacks[res.request_seq] ? _this._callbacks[res.request_seq](res) : console.log(res);
                }
                else if (res.type == "event") {
                    _this.emit(res.event, res.body);
                }
            }
        });
        return _this;
        // this._sendMessage("configure", {
        //     preferences: {
        //         includeCompletionsForModuleExports: true
        //     }
        // })
    }
    TSClient.prototype._sendMessage = function (command, args, cb) {
        var _this = this;
        var cmd = {
            type: "request",
            command: command,
            seq: cb ? ++this._seq : 0,
            arguments: args
        };
        if (cb) {
            this._callbacks.push(function (data) {
                delete _this._callbacks[_this._seq];
                cb(data);
            });
        }
        this._proc.stdin.write(JSON.stringify(cmd) + "\n");
    };
    TSClient.prototype.open = function (filename) {
        this._sendMessage("open", {
            file: filename
        });
    };
    TSClient.prototype.change = function (filename, fromLine, fromOffset, toLine, toOffset, text) {
        this._sendMessage("change", {
            file: filename,
            line: fromLine,
            offset: fromOffset,
            endLine: toLine,
            endOffset: toOffset,
            insertString: text
        });
    };
    TSClient.prototype.getCompletions = function (file, line, offset, prefix) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        _this._sendMessage("completions", {
                            file: file,
                            line: line,
                            offset: offset,
                            prefix: prefix,
                            "includeExternalModuleExports": true,
                            "includeInsertTextCompletions": true
                        }, resolve);
                    })];
            });
        });
    };
    TSClient.prototype.getCompletionEntryDetails = function (file, line, offset, entryNames) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        _this._sendMessage("completionEntryDetails", {
                            file: file,
                            line: line,
                            offset: offset,
                            entryNames: entryNames
                        }, resolve);
                    })];
            });
        });
    };
    TSClient.prototype.getDefinition = function (file, line, offset) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        _this._sendMessage("definition", {
                            file: file,
                            line: line,
                            offset: offset
                        }, resolve);
                    })];
            });
        });
    };
    TSClient.prototype.getErr = function (filename) {
        this._sendMessage("geterr", {
            delay: 0,
            files: [filename]
        });
    };
    TSClient.prototype.close = function () {
        this._proc.kill();
    };
    return TSClient;
}(events_1.EventEmitter));
exports["default"] = TSClient;
