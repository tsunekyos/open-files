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

        let successfulOpens = 0; // 成功したファイルオープンの数を追跡

        for (const filePath of filePaths) {
            const fullPath = path.join(workspaceFolder.uri.fsPath, filePath.trim());
            try {
                const document = await vscode.workspace.openTextDocument(fullPath);
                // 新しい列を計算（現在の列の右側に開く）
                const newColumn = (startColumn as number) + successfulOpens + 1;
                await vscode.window.showTextDocument(document, {
                    preview: false,
                    viewColumn: newColumn as vscode.ViewColumn,
                    preserveFocus: true
                });
                successfulOpens++; // 成功したらカウントを増やす
            } catch (err) {
                vscode.window.showWarningMessage(`ファイルを開けませんでした: ${filePath}`);
                // エラーの場合はカウントを増やさない
            }
        }

        if (successfulOpens > 0) {
            vscode.window.showInformationMessage(`${successfulOpens}個のファイルを開きました。`);
        } else {
            vscode.window.showWarningMessage('ファイルを開けませんでした。');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}