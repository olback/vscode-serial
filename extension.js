/*
 *  VS Code Serial Monitor 2
 *  github.com/olback/vscode-serial
 */

'use strict';

const vscode = require('vscode');
const SerialPort = require('serialport');

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

let ports = [];
let openConnections = [];

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

function openPort() {

    let port = {
        name: null,
        baud: null
    }

    // port.con = new SerialPort(port.name, { baudRate: port.baud });

    vscode.window.showQuickPick(ports, { placeHolder: 'Serial port to open' })
        .then(name => {
            port.name = name;
            vscode.window.showQuickPick(baudRates, { placeHolder: 'Baudrate. Default: 9600' })
                .then(rate => {
                    port.baud = Number(rate) ? Number(rate) : 9600;
                    port.con = new SerialPort(port.name, { baudRate: port.baud });
                    port.output = vscode.window.createOutputChannel(port.name);
                    console.log(port);
                });

        });

}

function activate(context) {

    console.log('vscode-serial active');

    context.subscriptions.push(
        vscode.commands.registerCommand('vscode-serial.scanPorts', scanPorts),
        vscode.commands.registerCommand('vscode-serial.openPort', openPort)
    );

}
exports.activate = activate;

function deactivate() {
    // Close all open connections
}
exports.deactivate = deactivate;
