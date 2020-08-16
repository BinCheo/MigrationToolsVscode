const vscode = require('vscode');
const fs = require('fs');
const readline = require('readline');
const path = require("path");
const XLSX = require('xlsx');
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let UpperToLowerCase = vscode.commands.registerCommand('binhtt.UpperToLowerCase', function () {
		const filePath = vscode.window.activeTextEditor.document.uri.fsPath;
		const fileXlsx = 'C:\\Users\\thanhbinh truong\\Documents\\Project\\Getti\\Book1.xlsx';
		const dictionary = getKeyNValue(fileXlsx);
		const comment = "'splus";
		repalcePattern(filePath, dictionary, comment);

	});
	let b2n = vscode.commands.registerCommand('binhtt.b2n', function () {
		const workbenchConfig = vscode.workspace.getConfiguration('workbench')
		const theme = workbenchConfig.get('colorTheme')

		var editor = vscode.window.activeTextEditor;
		comment = '\'splus';
		const fileXlsx = 'C:\\Users\\thanhbinh truong\\Documents\\Project\\Getti\\Book1.xlsx';
		const dictionary = getKeyNValue(fileXlsx);

		if (editor) {
			var selection = editor.selection;
			var selectionText = editor.document.getText(selection);
			var replaceText = '';
			var tab = getTab(selectionText);
			const arrSelectionText = selectionText.split('\r\n');
			const arrSelectionTextTemp = [];
			for (var i = 0; i < arrSelectionText.length; i++) {
				if (i == 0) replaceText += getTab(arrSelectionText[i]) + comment + '\r\n'
				arrSelectionTextTemp.push(arrSelectionText[i] + '\r\n');
				arrSelectionText[i] = getTab(arrSelectionText[i]) + '\'' + arrSelectionText[i].trim() + '\r\n';

				replaceText += arrSelectionText[i];
			}


			for (var i = 0; i < arrSelectionTextTemp.length; i++) {
				var r = arrSelectionTextTemp[i].match(/((&) \w.+(&))|(('" &) \w.+ (& "'))|(\{0\})|('\{0\}')|(:\w+)/);
				if (r && !arrSelectionTextTemp[i].includes('Now')) {
					arrSelectionTextTemp[i] = arrSelectionTextTemp[i].replace(/((&) \w.+(&))|(('" &) \w.+ (& "'))|(\{0\})|('\{0\}')|(:\w+)/, 'b2n\(' + r[0] + '\)');
				}

				replaceText += arrSelectionTextTemp[i];
			}

			editor.edit(builder => {
				builder.replace(selection, replaceText);
			})
				.then(success => {
					// var postion = editor.selection.end; 
					// editor.selection = new vscode.Selection(postion, postion);
				});
		}

	});
	context.subscriptions.push(UpperToLowerCase);
	context.subscriptions.push(b2n);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

function isInclude(line, dictionary) {
	for (var key in dictionary) {
		if (line.includes(key)) {
			return true;
		}
	}
	return false;
}

function getKeyNValue(file) {
	var workbook = XLSX.readFile(file);
	const worksheet = workbook.Sheets[workbook.SheetNames[0]];
	const columnA = [];
	const columnB = [];
	var r = {};
	for (let z in worksheet) {
		if (z.toString()[0] === 'A') {
			columnA.push(worksheet[z].v);
		}
		if (z.toString()[0] === 'B') {
			columnB.push(worksheet[z].v);
		}
	}
	for (var i = 0; i < columnA.length; i++) {
		r[columnA[i]] = columnB[i];
	}
	return r;
}
function getTab(line) {
	var tab = '';
	for (var i = 0; i < line.length; i++) {
		if (line.charAt(i) == ' ' || line.charAt(i) == '\t') {
			tab += line.charAt(i);
		} else {
			return tab;
		}
	}
	return tab;
}

function repalcePattern(filePath, dictionary, comment) {
	const fileName = path.basename(filePath);
	const fileTempPath = filePath.replace(fileName, fileName.split('.')[0] + "temp.vb");
	const readStream = fs.createReadStream(filePath);
	const writeStream = fs.createWriteStream(fileTempPath, { encoding: "utf8" });

	const rl = readline.createInterface({
		input: readStream,
		output: writeStream,
		terminal: false,
		historySize: 0
	});

	var newCode = [];
	var oldCode = [];
	var oldTab = '';
	rl.on("line", function (line) {
		var tab = ''
		if (line == '') {
			tab = oldTab;
		} else {
			tab = getTab(line);
			oldTab = tab;
		}

		var flagComment = true;
		oldCode.push(line);
		if (line.trim().charAt(0) != "\'" && isInclude(line, dictionary)) {
			for (var key in dictionary) {
				if (line.includes(key)) {
					line = line.replace(new RegExp(key, 'g'), dictionary[key].toLowerCase());
				}
			}
			newCode.push(line);

			flagComment = false;
		}
		if (flagComment) {
			if (newCode.length != oldCode.length && newCode.length > 0) {
				writeStream.write(tab + comment + "\r\n");
				for (var i = 0; i < oldCode.length - 1; i++) {
					writeStream.write(tab + '\'' + oldCode[i].trim() + "\r\n");
				}
				for (var i = 0; i < newCode.length; i++) {
					writeStream.write(newCode[i] + "\r\n");
				}
				writeStream.write(oldCode[oldCode.length - 1] + "\r\n");
			} else {
				writeStream.write(oldCode[0] + "\r\n");
			}
			oldCode = [];
			newCode = [];
		}

	});
}
module.exports = {
	activate,
	deactivate
}