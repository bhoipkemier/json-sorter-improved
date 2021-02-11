import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('json-sorter-imporved.sort', () => {
		const editor = vscode?.window?.activeTextEditor;
		const text = editor?.document?.getText();
		if (text === undefined) {
			error('Could not retrieve JSON to sort!');
			return;
		}
		editor?.edit((editorBuilder: vscode.TextEditorEdit) => {
			const document = editor.document;
			const firstLine = document.lineAt(0);
			const lastLine = document.lineAt(document.lineCount - 1);
			const selection = new vscode.Range(
				0,
				firstLine.range.start.character,
				document.lineCount - 1,
				lastLine.range.end.character
			);
			const sortedText = getSortedJson(text);
			if (!!sortedText) {
				editorBuilder.replace(selection, sortedText);
				vscode.window.showInformationMessage('Your JSON code has been sorted!');
			}
		});
	});

	context.subscriptions.push(disposable);
}

function error(message: string) {
	vscode.window.showErrorMessage(message);
}

function getSortedJson(text: string): string | undefined {
	let json: any;
	try {
		json = JSON.parse(text);
	} catch {
		error('Document does not contain valid JSON!');
		return undefined;
	}
	const numSpaces = vscode.workspace.getConfiguration("jsonSorterImproved")["numberOfSpaces"];
	return JSON.stringify(sort(json), undefined, numSpaces <= 0 ? '\t' : +numSpaces);
}

function sort(json: any): any {
	if (json instanceof Array) {
		return json;
	}

	if (typeof json === 'object' && Object.keys(json).length > 0) {
		let isCaseSensitive = vscode.workspace.getConfiguration("jsonSorterImproved")["caseSensitive"];
		isCaseSensitive = isCaseSensitive === true || isCaseSensitive === "true";
		let keys = Object.keys(json);
		keys = isCaseSensitive ? keys.sort() : keys.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
		return keys.reduce((prev, key) => {
			return { ...prev, [key]: sort(json[key]) };
		}, {});
	}

	return json;
}

export function deactivate() { }
