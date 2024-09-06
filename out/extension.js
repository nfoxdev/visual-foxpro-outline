"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const outlineProvider_1 = require("./outlineProvider");
function activate(context) {
    const provider = new outlineProvider_1.FoxProOutlineProvider();
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider({ language: 'foxpro' }, provider));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map