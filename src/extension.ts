import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('json-sorter-imporved.sort', () => {
		const editor = vscode?.window?.activeTextEditor;
		const text = editor?.document?.getText();
		if(text === undefined){
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
			editorBuilder.replace(selection, sortedText);
			vscode.window.showInformationMessage('Your JSON code has been sorted!');
		});
	});

	context.subscriptions.push(disposable);
}

function error(message : string) {
	vscode.window.showErrorMessage(message);
}

function getSortedJson(text: string): string {
	let json: any;
	try{
		json = JSON.parse(text);
	}catch{
		error('Document does not contain valid JSON!');
		return text;
	}
	return JSON.stringify(sort(json), undefined, 4);
}

function sort(json: any): any {
	if (json instanceof Array) {
		return json;
	}
	
	if (typeof json === 'object' && Object.keys(json).length > 0) {
		return Object.keys(json)
		.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1)
		.reduce((prev, key) => {
			return { ...prev, [key]: sort(json[key]) };
		}, {});
	}

	return json;
}

export function deactivate() {}
