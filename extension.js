/*
 *  VS Code Serial Monitor 2
 *  github.com/olback/vscode-serial
 */

'use strict';

const vscode = require('vscode');
const SerialPort = require('serialport');
const path = require('path');
const fs = require('fs');

const baudRates = [
    '110',
    '150',
    '300',
    '1200',
    '2400',
    '4800',
    '9600',
    '19200',
    '38400',
    '57600',
    '115200',
    '230400',
    '460800',
    '921600'
];

const confPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.vscode/serial.json');

let ports = [];
let con = {};
let sbi = {};
let output;

function scanPorts(showInfoMsg = true) {

    ports = [];

    SerialPort.list((err, _ports) => {

        if (err) return vscode.window.showErrorMessage(err);

        for (let port of _ports) {
            if (typeof port.vendorId !== 'undefined') {
                ports.push(port.comName);
            }
        }

        if (!showInfoMsg) return;

        if (ports.length === 1) {
            // return vscode.window.setStatusBarMessage(`Found ${ports.length} serail device`);
            return vscode.window.showInformationMessage(`Found ${ports.length} serail device`);
        } else {
            // return vscode.window.setStatusBarMessage(`Found ${ports.length} serail devices`);
            return vscode.window.showInformationMessage(`Found ${ports.length} serail devices`);
        }

    });

}

function selectPort() {

    vscode.window.showQuickPick(ports, { placeHolder: 'Serial port to open' })
        .then(port => {
            if (port === undefined) return;
            con.port = port;
            sbi.port.text = 'Port: ' + port;
            setTimeout(() => {
                openPort();
            }, 0);
        });

}

function setBaudrate() {

    vscode.window.showQuickPick(baudRates, { placeHolder: 'Set baudrate' })
        .then(baud => {
            if (baud === undefined) return;
            con.baud = Number(baud);
            sbi.baud.text = 'Baud: ' + Number(baud);
            setTimeout(() => {
                openPort();
            }, 0);
        });

}

function write() {

    if (typeof con.port !== 'string' || typeof con.baud !== 'number') {
        return vscode.window.showErrorMessage('Command unavailable. Connect to a device before sending data.');
    }

    vscode.window.showInputBox({ prompt: 'Write to port' })
        .then(input => {
            if (input === undefined) return;
            con.serial.write(input);
            output.appendLine('> ' + input);
        });

}

function writeBuffer() {

    if (typeof con.port !== 'string' || typeof con.baud !== 'number') {
        return vscode.window.showErrorMessage('Command unavailable. Connect to a device before sending data.');
    }

    vscode.window.showInputBox({ prompt: 'Write to port with buffer' })
        .then(input => {
            if (input === undefined) return;
            con.serial.write(Buffer.from(input));
            output.appendLine('> ' + Buffer.from(input));
        });

}

function openPort() {

    if (typeof con.port !== 'string' || typeof con.baud !== 'number') {
        return;
    }

    if(typeof con.serial === 'object' && con.serial.isOpen) {
        return vscode.window.showErrorMessage('Cannot open already opend port.');
    }

    con.serial = new SerialPort(con.port, { baudRate: con.baud, autoOpen: false });

    con.serial.open(err => {
        if (err) {
            console.log('err', err);
            return vscode.window.showErrorMessage(err.message);
        }
    });

    vscode.window.showInformationMessage(con.port + ' is now open.');
    output.show();
    output.appendLine('[Info] Serial connection opend - ' + con.port);

    con.serial.on('readable', () => {
        output.appendLine(con.serial.read());
        output.show();
    });

    sbi.toggle.text = '$(x)';
    sbi.toggle.tooltip = 'Click to disconnect';

}

function closePort(warn = true) {

    if(warn) {
        if (typeof con.serial === 'undefined' || !con.serial.isOpen) {
            return vscode.window.showWarningMessage('Cannot close port. No port open.');
        }
    }

    con.serial.close(() => {
        vscode.window.showInformationMessage('Closed connection to ' + con.port);
        output.appendLine('[Info] Serial connection closed - ' + con.port);
    }, err => {
        vscode.window.showErrorMessage(err.message);
    });

    sbi.toggle.text = '$(plug)';
    sbi.toggle.tooltip = 'Click to connect to port';

}

function togglePort() {
    
    if(typeof con.serial === 'object' && con.serial.isOpen) {
        closePort()
    } else {
        openPort();
    }

}

function generateConfig() {

    if (typeof con.port !== 'string' || typeof con.baud !== 'number') {
        return vscode.window.showErrorMessage('Connect to a device before generating a config file.');
    }

    if (fs.existsSync(confPath)) {
        vscode.window.showWarningMessage('The file .vscode/serial.js already exists. Overwrite?', 'Yes', 'No')
            .then(ans => {
                if (ans === 'Yes') writeConfig();
            });
    } else {
        writeConfig();
    }

}

function writeConfig() {

    const conf = {
        port: con.port,
        baud: con.baud,
        autoOpen: con.autoOpen
    }

    fs.writeFileSync(confPath, JSON.stringify(conf, null, 4) + '\r\n');

}

function activate(context) {

    console.log('vscode-serial active');

    output = vscode.window.createOutputChannel('Serial monitor');

    sbi.port = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    sbi.port.text = '<Select port>';
    sbi.port.tooltip = 'Click to select port';
    sbi.port.command = 'vscode-serial.selectPort';
    sbi.port.show();

    sbi.baud = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    sbi.baud.text = '<Set baudrate>';
    sbi.baud.tooltip = 'Click to select baudrate';
    sbi.baud.command = 'vscode-serial.setBaudrate';
    sbi.baud.show();

    sbi.toggle = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    sbi.toggle.text = '$(plug)';
    sbi.toggle.command = 'vscode-serial.togglePort';
    sbi.toggle.tooltip = 'Click to connect to port';
    sbi.toggle.show();

    context.subscriptions.push(
        vscode.commands.registerCommand('vscode-serial.activate', () => { }),
        vscode.commands.registerCommand('vscode-serial.scanPorts', scanPorts),
        vscode.commands.registerCommand('vscode-serial.selectPort', selectPort),
        vscode.commands.registerCommand('vscode-serial.setBaudrate', setBaudrate),
        vscode.commands.registerCommand('vscode-serial.openPort', openPort),
        vscode.commands.registerCommand('vscode-serial.write', write),
        vscode.commands.registerCommand('vscode-serial.writeBuffer', writeBuffer),
        vscode.commands.registerCommand('vscode-serial.closePort', closePort),
        vscode.commands.registerCommand('vscode-serial.togglePort', togglePort),
        vscode.commands.registerCommand('vscode-serial.generateConfig', generateConfig)
    );

    scanPorts(false);

    if (fs.existsSync(confPath)) {
        con = JSON.parse(fs.readFileSync(confPath));
        sbi.port.text = con.port;
        sbi.baud.text = String(con.baud);
    } else {
        con.autoOpen = false;
    }

    if (con.autoOpen) {
        openPort();
    }

}
exports.activate = activate;

function deactivate() {
    closePort(false);
}
exports.deactivate = deactivate;
