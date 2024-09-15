"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoxProOutlineProvider = void 0;
const vscode = require("vscode");
class FoxProOutlineProvider {
    provideDocumentSymbols(document) {
        const symbols = [];
        const regex = /^[ \t]*((LOCAL|PRIVATE|\*>|#DEFINE|#INCLUDE|PROCEDURE|FUNCTION|DEFINE CLASS|RETURN)[ \t]+([^\r\n]+)|(RETURN))/gim;
        let match;
        let currentClassSymbol = null;
        let currentProcSymbol = null;
        while ((match = regex.exec(document.getText())) !== null) {
            let kind;
            let outlineword = match[2] || match[4];
            let funcdef = match[3] || ".t.";
            switch (outlineword.toUpperCase()) {
                case "FUNCTION":
                case "FUNC":
                    kind = vscode.SymbolKind.Method;
                    break;
                case "PROCEDURE":
                case "PROC":
                    kind = vscode.SymbolKind.Method;
                    break;
                case "DEFINE CLASS":
                    kind = vscode.SymbolKind.Class;
                    break;
                case "RETURN":
                    kind = vscode.SymbolKind.Event;
                    break;
                case "#DEFINE":
                    kind = vscode.SymbolKind.Constant;
                    break;
                case "#INCLUDE":
                    kind = vscode.SymbolKind.File;
                    break;
                case "*>":
                    kind = vscode.SymbolKind.String;
                    break;
                case "LOCAL":
                case "PRIVATE":
                    kind = vscode.SymbolKind.Variable;
                    break;
                default:
                    kind = vscode.SymbolKind.Function;
            }
            const symbol = new vscode.DocumentSymbol(funcdef, outlineword, kind, new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length)), new vscode.Range(document.positionAt(match.index + outlineword.length + 1), document.positionAt(match.index + match[0].length)));
            if (kind === vscode.SymbolKind.Class) {
                currentClassSymbol = symbol;
                symbols.push(symbol);
            }
            else {
                if (kind === vscode.SymbolKind.Method ||
                    kind === vscode.SymbolKind.Function) {
                    currentProcSymbol = symbol;
                    if (currentClassSymbol !== null) {
                        currentClassSymbol.children.push(symbol);
                    }
                    else {
                        symbols.push(symbol);
                    }
                }
                else {
                    if (currentProcSymbol !== null) {
                        currentProcSymbol.children.push(symbol);
                    }
                    else {
                        symbols.push(symbol);
                    }
                }
            }
        }
        return symbols;
    }
}
exports.FoxProOutlineProvider = FoxProOutlineProvider;
//# sourceMappingURL=outlineProvider.js.map