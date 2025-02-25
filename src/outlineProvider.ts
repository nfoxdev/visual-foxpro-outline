
import * as vscode from "vscode";

export class FoxProOutlineProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(
    document: vscode.TextDocument
  ): vscode.DocumentSymbol[] {
    const symbols: vscode.DocumentSymbol[] = [];

    const regex = /^\s*((DIMENSION|LOCAL|PRIVATE|PUBLIC|\*>|#DEFINE|#INCLUDE|(PROTECTED|HIDDEN)\s+(PROCEDURE|FUNCTION)|PROCEDURE|FUNCTION|DEFINE CLASS|ADD OBJECT|RETURN|PROTECTED|HIDDEN)\s+([^\r\n]+)|(RETURN)\b|(\w+)\s*(=))/gim;

    let match: RegExpExecArray | null;
    let currentClassSymbol: vscode.DocumentSymbol | null = null;
    let currentProcSymbol: vscode.DocumentSymbol | null = null;
    let currentObjectSymbol: vscode.DocumentSymbol | null = null;
    let kind: vscode.SymbolKind;
    let tagMatch = ''
    let outlineKind = "???";
    let outlineName = "???";

    while ((match = regex.exec(document.getText())) !== null) {

      tagMatch = ( match[8] || match[2] || match[3] || match[4] ).toUpperCase().replace(/\s+/, ' ');
      outlineName = match[5]
      outlineKind = ''

      switch (tagMatch) {
        case "ADD OBJECT":
          outlineKind = 'object'
          outlineName = outlineName.match(/(.*?)(?:WITH .*)?$/)[1]
          kind = vscode.SymbolKind.Object
          break;
        case "HIDDEN FUNCTION":
        case "HIDDEN PROCEDURE":
          outlineKind = 'hidden'
          kind = vscode.SymbolKind.Method
          break;
        case "PROTECTED FUNCTION":
        case "PROTECTED PROCEDURE":
          outlineKind = 'protected'
          kind = vscode.SymbolKind.Method
          break;
        case "FUNCTION":
        case "PROCEDURE":
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
          outlineKind = ''
          break;
        case "LOCAL":
        case "PRIVATE":
        case "PROTECTED":
        case "HIDDEN":
        case "PUBLIC":
        case "=":
          kind = currentClassSymbol && !currentProcSymbol ? vscode.SymbolKind.Property : vscode.SymbolKind.Variable;
          outlineKind = match[2] || "" // local private protected..
          outlineName = match[3] || match[5] || match[7]
          break;
      }

      let startpos = match.index + match[0].split('\n').length + match[0].split('\r').length
      let lineno = document.positionAt(startpos).line
      let symbolRange = new vscode.Range(lineno,1,lineno,startpos + match[0].length);


      const symbol = new vscode.DocumentSymbol(
        outlineName,
        outlineKind,
        kind,
        symbolRange,
        symbolRange);

      if (kind === vscode.SymbolKind.Class) {
        currentClassSymbol  = symbol;
        currentProcSymbol   = null;
        currentObjectSymbol = null;
      }
      else if (kind === vscode.SymbolKind.Method) {
        currentProcSymbol = symbol
        currentObjectSymbol = null
      }
      else if (kind === vscode.SymbolKind.Object) {
        currentObjectSymbol = symbol
      }


      if (currentObjectSymbol && kind !== vscode.SymbolKind.Object) {
        currentObjectSymbol.children.push(symbol);
      } else if (currentProcSymbol && kind !== vscode.SymbolKind.Method) {
        currentProcSymbol.children.push(symbol);
      } else if (currentClassSymbol && kind !== vscode.SymbolKind.Class) {
        currentClassSymbol.children.push(symbol);
      } else {
        symbols.push(symbol)
      }
    }

    return symbols;
  }
}
