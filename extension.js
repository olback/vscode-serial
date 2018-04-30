// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const serial = require('serialport');

function activate(context) {

    console.log('vscode-serial active');

    let disposable = vscode.commands.registerCommand('vscode-serial.openPort', function () {
        vscode.window.showInformationMessage('Open Serial port');
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {
    // Close all open connections
}
exports.deactivate = deactivate;
