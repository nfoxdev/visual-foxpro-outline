
import * as vscode from "vscode";

export class FoxProOutlineProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(
    document: vscode.TextDocument
  ): vscode.DocumentSymbol[] {
    const symbols: vscode.DocumentSymbol[] = [];

    const regex = /^[ \t]*((PROCEDURE|FUNCTION|DEFINE CLASS|RETURN)[ \t]+([^\r\n]+)|(RETURN))/gim;

    let match: RegExpExecArray | null;
    let currentClassSymbol: vscode.DocumentSymbol | null = null;
    let currentProcSymbol: vscode.DocumentSymbol | null = null;

    while ((match = regex.exec(document.getText())) !== null) {
      let kind: vscode.SymbolKind;

      let outlineword = match[2] || match[4];
      let funcdef = match[3] || ".t.";

      switch (outlineword.toUpperCase()) {
        case "FUNCTION":
        case "FUNC":
          kind = vscode.SymbolKind.Function;
          break;
        case "PROCEDURE":
        case "PROC":
          kind = vscode.SymbolKind.Method;
          break;
        case "DEFINE CLASS":
          kind = vscode.SymbolKind.Class;
          break;
        case "RETURN":
          kind = vscode.SymbolKind.Variable;
          break;
        default:
          kind = vscode.SymbolKind.Function;
      }

      const symbol = new vscode.DocumentSymbol(
        funcdef,
        outlineword,
        kind,
        new vscode.Range(
          document.positionAt(match.index),
          document.positionAt(match.index + match[0].length)
        ),
        new vscode.Range(
          document.positionAt(match.index + outlineword.length + 1),
          document.positionAt(match.index + match[0].length)
        )
      );

      if (kind === vscode.SymbolKind.Class) {
        currentClassSymbol = symbol;
        symbols.push(symbol);
      } else {
        if (
          kind === vscode.SymbolKind.Method ||
          kind === vscode.SymbolKind.Function
        ) {
          currentProcSymbol = symbol;
        }
        if (currentClassSymbol !== null && kind !== vscode.SymbolKind.Variable) {
          currentClassSymbol.children.push(symbol);
        } else if (
          currentProcSymbol !== null &&
          kind === vscode.SymbolKind.Variable
        ) {
          currentProcSymbol.children.push(symbol);
        } else {
          symbols.push(symbol);
        }
      }
    }
    return symbols;
  }
}
