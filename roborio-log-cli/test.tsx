import React from 'react';
import test from 'ava';
import {render} from 'ink-testing-library';
import App from './source/app.js';

const defaultProps = {
	address: '10.0.0.2',
	remotePath: '/U/logs',
	outputDir: '.',
	listOnly: false,
	downloadAll: false,
};

test('shows connecting screen on mount', t => {
	const {lastFrame} = render(<App {...defaultProps} />);
	// The first frame should show the spinner and the target address
	t.true(lastFrame()!.includes('10.0.0.2'));
});
