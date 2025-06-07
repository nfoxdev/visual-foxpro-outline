"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoxProOutlineProvider = void 0;
const vscode = require("vscode");
class FoxProOutlineProvider {
    provideDocumentSymbols(document) {
        const symbols = [];
        const regexText = "^[ \\t]*((\\w+)[ \\t]*(=)|(PROTECTED +PROCEDURE|HIDDEN +PROCEDURE|DIMENSION|LOCAL|PRIVATE|PUBLIC|#DEFINE|#INCLUDE|PROTECTED|HIDDEN|PROCEDURE|FUNCTION|DEFINE CLASS|ENDDEFINE|ADD OBJECT|RETURN)[ \\t]+([^\\r\\n]+)|(RETURN))";
        const regex = new RegExp(regexText, "gim");
        let match;
        let currentClassSymbol = null;
        let currentProcSymbol = null;
        let currentObjectSymbol = null;
        let kind;
        let tagMatch = '';
        let outlineKind = "???";
        let outlineName = "???";
        const doctext = document.getText();
        while ((match = regex.exec(doctext)) !== null) {
            tagMatch = match[3] || match[4] || match[6];
            tagMatch = tagMatch.toUpperCase().replace(/\s+/, ' ');
            outlineName = match[2] || match[5] || ".T.";
            outlineKind = '';
            switch (tagMatch) {
                case "DEFINE CLASS":
                    kind = vscode.SymbolKind.Class;
                    break;
                case "ENDDEFINE":
                    currentClassSymbol = null;
                    currentProcSymbol = null;
                    currentObjectSymbol = null;
                    continue;
                case "ADD OBJECT":
                    outlineKind = 'object';
                    outlineName = outlineName.match(/(.*?)(?:WITH .*)?$/)[1];
                    kind = vscode.SymbolKind.Object;
                    break;
                case "HIDDEN FUNCTION":
                case "HIDDEN PROCEDURE":
                    outlineKind = 'hidden';
                    kind = vscode.SymbolKind.Method;
                    break;
                case "PROTECTED FUNCTION":
                case "PROTECTED PROCEDURE":
                    outlineKind = 'protected';
                    kind = vscode.SymbolKind.Method;
                    break;
                case "FUNCTION":
                case "PROCEDURE":
                    kind = vscode.SymbolKind.Method;
                    break;
                case "RETURN":
                    kind = vscode.SymbolKind.Event;
                    outlineKind = '';
                    break;
                case "#DEFINE":
                    kind = vscode.SymbolKind.Constant;
                    break;
                case "#INCLUDE":
                    kind = vscode.SymbolKind.File;
                    break;
                case "LOCAL":
                case "PRIVATE":
                case "PROTECTED":
                case "HIDDEN":
                case "PUBLIC":
                case "DIMENSION":
                case "=":
                    kind = currentClassSymbol && !currentProcSymbol ? vscode.SymbolKind.Property : vscode.SymbolKind.Variable;
                    outlineKind = tagMatch;
                    break;
                default:
                    continue; /* should not happen! */
            }
            let lineno = document.positionAt(match.index).line;
            let symbolRange = new vscode.Range(lineno, 1, lineno, match[0].length);
            const symbol = new vscode.DocumentSymbol(outlineName, outlineKind, kind, symbolRange, symbolRange);
            if (kind === vscode.SymbolKind.Class) {
                currentClassSymbol = symbol;
                currentProcSymbol = null;
                currentObjectSymbol = null;
            }
            else if (kind === vscode.SymbolKind.Method) {
                currentProcSymbol = symbol;
                currentObjectSymbol = null;
            }
            else if (kind === vscode.SymbolKind.Object) {
                currentObjectSymbol = symbol;
            }
            if (currentObjectSymbol && kind !== vscode.SymbolKind.Object) {
                currentObjectSymbol.children.push(symbol);
            }
            else if (currentProcSymbol && kind !== vscode.SymbolKind.Method) {
                currentProcSymbol.children.push(symbol);
            }
            else if (currentClassSymbol && kind !== vscode.SymbolKind.Class) {
                currentClassSymbol.children.push(symbol);
            }
            else {
                symbols.push(symbol);
            }
        }
        return symbols;
    }
}
exports.FoxProOutlineProvider = FoxProOutlineProvider;
//# sourceMappingURL=outlineProvider.js.map