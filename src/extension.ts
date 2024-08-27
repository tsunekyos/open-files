import * as vscode from 'vscode';
import * as fs from 'node:fs';
import * as path from 'node:path';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('open-files.openFilesFromInput', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('ワークスペースが開かれていません。');
            return;
        }

        const config = vscode.workspace.getConfiguration('openFiles');
        const inputFilePath = config.get<string>('inputFilePath') || 'input.txt';
        const fullInputPath = path.join(workspaceFolder.uri.fsPath, inputFilePath);

        try {
            const fileContent = await fs.promises.readFile(fullInputPath, 'utf-8');
            const filePaths = fileContent.split('\n').filter(line => line.trim() !== '');

            for (const filePath of filePaths) {
                const fullPath = path.join(workspaceFolder.uri.fsPath, filePath.trim());
                try {
                    const document = await vscode.workspace.openTextDocument(fullPath);
                    await vscode.window.showTextDocument(document, { preview: false });
                } catch (err) {
                    vscode.window.showWarningMessage(`ファイルを開けませんでした: ${filePath}`);
                }
            }

            vscode.window.showInformationMessage('指定されたファイルを開きました。');
        } catch (err) {
            vscode.window.showErrorMessage(`input.txtファイルを読み込めませんでした: ${err}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}