import * as vscode from 'vscode';
import { FoxProOutlineProvider } from './outlineProvider';

export function activate(context: vscode.ExtensionContext) {
  const provider = new FoxProOutlineProvider();
  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider(
      { language: 'foxpro' },
      provider
    )
  );
}

export function deactivate() {}
