import * as vscode from 'vscode';
import * as path from 'node:path';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('open-files.openFilesFromCurrentFile', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('アクティブなエディタがありません。');
            return;
        }

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('ワークスペースが開かれていません。');
            return;
        }

        const currentFileContent = activeEditor.document.getText();
        const filePaths = currentFileContent.split('\n').filter(line => line.trim() !== '');

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
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}