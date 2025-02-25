
import * as vscode from "vscode";

export class FoxProOutlineProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(
    document: vscode.TextDocument
  ): vscode.DocumentSymbol[] {
    const symbols: vscode.DocumentSymbol[] = [];

    const regex = /^\s*((LOCAL|PRIVATE|PUBLIC|\*>|#DEFINE|#INCLUDE|(PROTECTED|HIDDEN)\s+(PROCEDURE|FUNCTION)|PROCEDURE|FUNCTION|DEFINE CLASS|RETURN|PROTECTED|HIDDEN)\s+([^\r\n]+)|(RETURN)\b|(\w+)\s*=)/gim;

    let match: RegExpExecArray | null;
    let currentClassSymbol: vscode.DocumentSymbol | null = null;
    let currentProcSymbol: vscode.DocumentSymbol | null = null;
    let kind: vscode.SymbolKind;
    let outlineword = "???";
    let funcdef = "???";

    while ((match = regex.exec(document.getText())) !== null) {

      outlineword = match[2] || match[4] || "VAR";
      outlineword = outlineword.toUpperCase().replace(/\s+/,' ');
          funcdef = match[5]

      switch (outlineword) {
        case "HIDDEN FUNCTION":
        case "HIDDEN PROCEDURE":
          outlineword = 'hidden'
          kind = vscode.SymbolKind.Method
          break;
        case "PROTECTED FUNCTION":
        case "PROTECTED PROCEDURE":
          outlineword = 'protected'
          kind = vscode.SymbolKind.Method
          break;
        case "FUNCTION":
        case "PROCEDURE":
          kind = vscode.SymbolKind.Method;
          outlineword=''
          break;
        case "DEFINE CLASS":
          kind = vscode.SymbolKind.Class;
          funcdef = match[5]
          outlineword=''
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
          outlineword=''
          break;
        case "LOCAL":
        case "PRIVATE":
        case "PROTECTED":
        case "HIDDEN":
        case "PUBLIC":
        case "VAR":
          kind = currentClassSymbol && !currentProcSymbol ? vscode.SymbolKind.Property : vscode.SymbolKind.Variable;
          outlineword = match[2] || ""
          funcdef = match[3] || match[5] ||  match[7]
          break;
        default:
          kind = vscode.SymbolKind.Function;
      }

    let startpos = match.index + match[0].split('\n').length 

      let symbolRange = new vscode.Range(
        document.positionAt( startpos ),
        document.positionAt( startpos + match[0].length)
      );


      const symbol = new vscode.DocumentSymbol(
        funcdef,
        outlineword,
        kind,
        symbolRange,
        symbolRange);

      if (kind === vscode.SymbolKind.Class) {
        currentClassSymbol = symbol;
        symbols.push(symbol);
        currentProcSymbol = null;
      } else {
        if (currentProcSymbol && kind !== vscode.SymbolKind.Method ) {
          currentProcSymbol.children.push(symbol);
        } else if (currentClassSymbol) {
          currentClassSymbol.children.push(symbol);
        } else {
          symbols.push(symbol)
        }
      }

      if (
        kind === vscode.SymbolKind.Method ||
        kind === vscode.SymbolKind.Function
      ) {
        currentProcSymbol = symbol;
      }
    }
    return symbols;
  }
}
