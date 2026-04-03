#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';
import {USB_ADDRESS} from './ftp.js';

const cli = meow(
	`
	Usage
	  $ roborio-log-cli --address <ip> [options]

	Options
	  --address  Robot IP address, e.g. 10.TE.AM.2
	  --usb      Use USB roboRIO address (172.22.11.2)
	  --path     Remote log folder path  [default: /U/logs]
	  --output   Local folder to save files into  [default: .]
	  --list     List files only, do not download
	  --all      Download all files without prompting

	Examples
	  $ roborio-log-cli --address 10.63.28.2
	  $ roborio-log-cli --usb --all --output ./logs
	  $ roborio-log-cli --address 10.63.28.2 --path /U/logs --list
`,
	{
		importMeta: import.meta,
		flags: {
			address: {type: 'string'},
			usb: {type: 'boolean', default: false},
			path: {type: 'string', default: '/U/logs'},
			output: {type: 'string', default: '.'},
			list: {type: 'boolean', default: false},
			all: {type: 'boolean', default: false},
		},
	},
);

const {address: rawAddress, usb, path: remotePath, output, list: listOnly, all: downloadAll} =
	cli.flags;

if (!rawAddress && !usb) {
	console.error('Error: --address <ip> is required (or use --usb).');
	process.exit(1);
}

// Strip leading zeros from each octet to match AdvantageScope behaviour
// https://github.com/Mechanical-Advantage/AdvantageScope/issues/167
const address = (usb ? USB_ADDRESS : rawAddress!)
	.split('.')
	.map(p => p.replace(/^0+/, '') || '0')
	.join('.');

render(
	<App
		address={address}
		remotePath={remotePath}
		outputDir={output}
		listOnly={listOnly}
		downloadAll={downloadAll}
	/>,
);
