# Extension layout

## Functions:
* Scan for ports
* Close all open ports
* Open port
* Close port
* Monitor port
* Send buffer to port
* Send text to port

## Unit tests
* Write unit tests for once...

## Structure
* Every connection is a object with its own output

```Javascript
let connections = [
    {
        port: {
            comName: '/dev/ttyACM0'
        },
        terminal: {
            // Term obj
        }
    },
    {
        port: {
            comName: '/dev/ttyACM1'
        },
        terminal: {
            // Term obj
        }
    }
];
```
