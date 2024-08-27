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

        // 現在のアクティブなエディタの列を取得
        const startColumn = activeEditor.viewColumn || vscode.ViewColumn.One;

        for (let i = 0; i < filePaths.length; i++) {
            const filePath = filePaths[i];
            const fullPath = path.join(workspaceFolder.uri.fsPath, filePath.trim());
            try {
                const document = await vscode.workspace.openTextDocument(fullPath);
                // 新しい列を計算（現在の列の右側に開く）
                const newColumn = (startColumn as number) + i + 1;
                await vscode.window.showTextDocument(document, {
                    preview: false,
                    viewColumn: newColumn as vscode.ViewColumn,
                    preserveFocus: true
                });
            } catch (err) {
                vscode.window.showWarningMessage(`ファイルを開けませんでした: ${filePath}`);
            }
        }

        vscode.window.showInformationMessage('指定されたファイルを開きました。');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}