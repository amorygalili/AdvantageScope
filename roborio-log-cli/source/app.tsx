import {Client as FTPClient} from 'basic-ftp';
import {Box, Text, useApp, useInput} from 'ink';
import path from 'path';
import React, {useEffect, useRef, useState} from 'react';
import {
	buildDownloadTasks,
	FileEntry,
	formatBytes,
	listRemoteFiles,
	remoteBase,
	DOWNLOAD_TIMEOUT_MS,
} from './ftp.js';

// ── Types & constants ─────────────────────────────────────────────────────────

type Phase = 'connecting' | 'selecting' | 'downloading' | 'done' | 'error';

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const BAR_WIDTH = 30;

export type AppProps = {
	address: string;
	remotePath: string;
	outputDir: string;
	listOnly: boolean;
	downloadAll: boolean;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function App({address, remotePath, outputDir, listOnly, downloadAll}: AppProps) {
	const {exit} = useApp();
	const clientRef = useRef<FTPClient | null>(null);
	const base = remoteBase(remotePath);

	const [phase, setPhase] = useState<Phase>('connecting');
	const [errorMsg, setErrorMsg] = useState('');
	const [doneMsg, setDoneMsg] = useState('');
	const [files, setFiles] = useState<FileEntry[]>([]);
	const [cursor, setCursor] = useState(0);
	const [selected, setSelected] = useState<Set<number>>(new Set());
	const [pendingDownload, setPendingDownload] = useState<FileEntry[] | null>(null);
	const [progress, setProgress] = useState({filename: '', current: 0, total: 0});
	const [spinFrame, setSpinFrame] = useState(0);

	// Spinner animation while loading/transferring
	useEffect(() => {
		if (phase !== 'connecting' && phase !== 'downloading') return;
		const id = setInterval(() => setSpinFrame(f => (f + 1) % SPINNER.length), 80);
		return () => clearInterval(id);
	}, [phase]);

	// Auto-exit once terminal phase is reached
	useEffect(() => {
		if (phase !== 'done' && phase !== 'error') return;
		const id = setTimeout(() => exit(), 150);
		return () => clearTimeout(id);
	}, [phase]);

	// Connect to roboRIO and list remote files
	useEffect(() => {
		let cancelled = false;
		const ftp = new FTPClient(DOWNLOAD_TIMEOUT_MS);
		clientRef.current = ftp;

		(async () => {
			try {
				await ftp.access({host: address});
			} catch (err: unknown) {
				if (!cancelled) {
					setErrorMsg(`Connection failed: ${String((err as Error).message)}`);
					setPhase('error');
				}

				return;
			}

			let rows: FileEntry[];
			try {
				rows = await listRemoteFiles(ftp, remotePath);
			} catch (err: unknown) {
				if (!cancelled) {
					setErrorMsg(`Failed to list ${base}: ${String((err as Error).message)}`);
					setPhase('error');
				}

				return;
			}

			if (cancelled) return;
			setFiles(rows);

			if (listOnly) {
				setPhase('done');
			} else if (downloadAll) {
				setPendingDownload(rows);
				setPhase('downloading');
			} else {
				setPhase('selecting');
			}
		})();

		return () => {
			cancelled = true;
			ftp.close();
		};
	}, []);

	// Execute download when pendingDownload is set
	useEffect(() => {
		if (phase !== 'downloading' || pendingDownload === null) return;
		const ftp = clientRef.current!;

		(async () => {
			const {tasks, skipped} = await buildDownloadTasks(ftp, pendingDownload, base, outputDir);

			if (tasks.length === 0) {
				setDoneMsg('All selected files already exist locally — nothing to download.');
				setPhase('done');
				return;
			}

			const sizeTotal = tasks.reduce((s, t) => s + t.size, 0);
			let bytesDone = 0;

			for (const task of tasks) {
				const filename = path.basename(task.local);
				setProgress({filename, current: bytesDone, total: sizeTotal});
				ftp.trackProgress(info => {
					setProgress({filename, current: bytesDone + info.bytes, total: sizeTotal});
				});
				await ftp.downloadTo(task.local, task.remote);
				bytesDone += task.size;
			}

			ftp.trackProgress();
			ftp.close();

			const skipNote = skipped > 0 ? ` (${skipped} skipped)` : '';
			setDoneMsg(`Saved ${tasks.length} file${tasks.length === 1 ? '' : 's'} to ${outputDir}${skipNote}`);
			setPhase('done');
		})();
	}, [phase, pendingDownload]);

	// Keyboard controls for the file-selection screen
	useInput((input, key) => {
		if (phase !== 'selecting') return;

		if (key.upArrow) {
			setCursor(c => Math.max(0, c - 1));
		} else if (key.downArrow) {
			setCursor(c => Math.min(files.length - 1, c + 1));
		} else if (input === ' ') {
			setSelected(prev => {
				const next = new Set(prev);
				if (next.has(cursor)) next.delete(cursor);
				else next.add(cursor);
				return next;
			});
		} else if (input === 'a') {
			setSelected(prev =>
				prev.size === files.length ? new Set() : new Set(files.map((_, i) => i)),
			);
		} else if (key.return) {
			if (selected.size === 0) return;
			setPendingDownload(files.filter((_, i) => selected.has(i)));
			setPhase('downloading');
		} else if (input === 'q' || key.escape) {
			clientRef.current?.close();
			exit();
		}
	});

	// ── Render ────────────────────────────────────────────────────────────────

	const spin = SPINNER[spinFrame];

	if (phase === 'connecting') {
		return (
			<Text>
				{spin} Connecting to <Text bold>{address}</Text>…
			</Text>
		);
	}

	if (phase === 'error') {
		return <Text color="red">✗ {errorMsg}</Text>;
	}

	if (phase === 'done') {
		if (listOnly) {
			return (
				<Box flexDirection="column">
					<Text bold>
						Files in <Text color="cyan">{remotePath}</Text>:
					</Text>
					<Text> </Text>
					{files.map((f, i) => (
						<Box key={i} gap={2}>
							<Text dimColor>{f.isFolder ? '📁' : '  '}</Text>
							<Text>{f.name}</Text>
							<Text dimColor>{formatBytes(f.size)}</Text>
						</Box>
					))}
				</Box>
			);
		}

		return <Text color="green">✓ {doneMsg}</Text>;
	}

	if (phase === 'selecting') {
		return (
			<Box flexDirection="column">
				<Text bold>
					Files in <Text color="cyan">{remotePath}</Text>:
				</Text>
				<Text> </Text>
				{files.map((f, i) => {
					const active = i === cursor;
					const checked = selected.has(i);
					return (
						<Box key={i}>
							<Text color={active ? 'cyan' : undefined}>{active ? '▶ ' : '  '}</Text>
							<Text color={checked ? 'green' : 'gray'}>[{checked ? '✓' : ' '}] </Text>
							<Text bold={active}>
								{f.isFolder ? '📁 ' : ''}
								{f.name}
							</Text>
							<Text dimColor>{'  '}{formatBytes(f.size)}</Text>
						</Box>
					);
				})}
				<Text> </Text>
				<Text dimColor>↑/↓ navigate · space select · a toggle all · enter download · q quit</Text>
				{selected.size > 0 && (
					<Text color="cyan">
						{selected.size} file{selected.size === 1 ? '' : 's'} selected
					</Text>
				)}
			</Box>
		);
	}

	if (phase === 'downloading') {
		const {filename, current, total} = progress;
		const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
		const filled = Math.round((pct / 100) * BAR_WIDTH);
		const bar = '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
		return (
			<Box flexDirection="column">
				<Text>
					{spin} Downloading <Text bold>{filename}</Text>…
				</Text>
				<Text>
					{'['}
					<Text color="green">{bar}</Text>
					{']'} {pct}%{'  '}
					<Text dimColor>
						{formatBytes(current)} / {formatBytes(total)}
					</Text>
				</Text>
			</Box>
		);
	}

	return null;
}
