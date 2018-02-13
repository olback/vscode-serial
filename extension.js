/**
 *  vscode-serial
 *  https://github.com/olback/vscode-serial
 *  olback © 2018
 */

'use strict';

const vscode = require('vscode');
const serialjs = require('serialport-js');

const openPorts = [];
const outputs = [];

let delimiter = '\r\n';

async function openPort() {

    const ports = await serialjs.find();
    let port;

    //console.log('Ports: ', ports);

    if(ports.length) {

        let quickpicks = [];

        for(let i = 0; i < ports.length; i++) {
            quickpicks.push(ports[i].port);
        }

        await vscode.window.showQuickPick(quickpicks, {ignoreFocusOut: true, placeHolder: 'Serial port to open'})
        .then(input => {
            port = input;
        });

        if(typeof(port) !== 'string') {
            return;
        }

        for(let i = 0; i < openPorts.length; i++) {
            if(openPorts[i].serialPort == port) {
                return vscode.window.showErrorMessage('Serial: Can not open ' + port + ' because it is already open.');
            }
        }

        let serial = await serialjs.open(port, delimiter);
        openPorts.push(serial);

        outputs.push(vscode.window.createOutputChannel(port));
        outputs[outputs.length-1].show();

        let index;
        for(index = 0; index < openPorts.length; index++) {
            if(openPorts[index].serialPort == port) {
                break;
            }
        }

        //console.log('Open ports: ', openPorts);

        vscode.window.showInformationMessage('Serial: Serial port ' + port + ' open');

        serial.on('data', (data) => {
            outputs[index].appendLine(data);
        });

        serial.on('error', (error) => {
            outputs[index].appendLine(data);
        });

    }

}

async function closePort() {

    if(openPorts.length == 0) {
        return vscode.window.showWarningMessage('Serial: No serial connections open.');
    }

    let port;

    let quickpicks = [];
    for(let i = 0; i < openPorts.length; i++) {
        quickpicks.push(openPorts[i].serialPort);
    }

    await vscode.window.showQuickPick(quickpicks, {ignoreFocusOut: true, placeHolder: 'Serial port to close'})
    .then(input => {
        port = input;
    });

    if(typeof(port) !== 'string') {
        return;
    }

    let index;
    for(index = 0; index < openPorts.length; index++) {
        if(openPorts[index].serialPort == port) {
            break;
        }
    }

    openPorts[index].close();
    outputs[index].dispose();

    openPorts.splice(index, 1);
    outputs.splice(index, 1);

    console.log('Open ports: ', openPorts.length);
    console.log('Outputs: ', outputs.length);

    vscode.window.showInformationMessage('Serial: Serial port ' + port + ' closed');

}

async function sendCommand() {

    if(openPorts.length == 0) {
        return vscode.window.showWarningMessage('Serial: No serial connection to send command to.');
    }

    let command;
    let port;

    let quickpicks = [];
    for(let i = 0; i < openPorts.length; i++) {
        quickpicks.push(openPorts[i].serialPort);
    }

    await vscode.window.showQuickPick(quickpicks, {ignoreFocusOut: true, placeHolder: 'Serial port to send command to'})
    .then(input => {
        port = input;
    });

    if(typeof(port) !== 'string') {
        return;
    }

    await vscode.window.showInputBox({ignoreFocusOut: true, placeHolder: 'Command to send'})
    .then(input => {
        command = input;
    });

    if(typeof(command) !== 'string' || command == '') {
        return;
    }

    let index;
    for(index = 0; index < openPorts.length; index++) {
        if(openPorts[index].serialPort == port) {
            break;
        }
    }

    openPorts[index].send(command);

}

async function setDeli() {

    let oldDeli = delimiter.replace('\n', '\\n');
    oldDeli = oldDeli.replace('\r', '\\r');

    const delimiters = ['\n', '\r', '\r\n'];
    const deliMeny = ['Newline', 'Carriage return', 'CR & NL'];

    await vscode.window.showQuickPick(deliMeny, {ignoreFocusOut: true, placeHolder: 'Delimiters'})
    .then(input => {
        let index = deliMeny.indexOf(input);
        delimiter = delimiters[index];
    });

    let newDeli = delimiter.replace('\n', '\\n');
    newDeli = newDeli.replace('\r', '\\r');

    vscode.window.showInformationMessage('Set delimiter to ' + newDeli + '. Previous value was ' + oldDeli + '.');
    console.log(delimiter);

}

function activate(context) {

    console.log('vscode-serial is active!');

    context.subscriptions.push(
        vscode.commands.registerCommand('vscode-serial.openPort', openPort),
        vscode.commands.registerCommand('vscode-serial.closePort', closePort),
        vscode.commands.registerCommand('vscode-serial.sendCommand', sendCommand),
        vscode.commands.registerCommand('vscode-serial.setDeli', setDeli),
    );

}
exports.activate = activate;


function deactivate() {
    // Close serial connections here!
    for(let i = 0; i < openPorts.length; i++) {
        console.log('Closing ', openPorts[i].serialPort);
        openPorts[i].close();
    }
}
exports.deactivate = deactivate;
