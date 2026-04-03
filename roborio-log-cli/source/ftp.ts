import {Client as FTPClient, FileInfo} from 'basic-ftp';
import fs from 'fs';
import path from 'path';

// ── Constants ─────────────────────────────────────────────────────────────────

export const USB_ADDRESS = '172.22.11.2';
export const DOWNLOAD_TIMEOUT_MS = 2000;
export const LOG_EXTENSIONS = ['.rlog', '.wpilog', '.wpilogxz', '.hoot', '.revlog'];

// ── Types ─────────────────────────────────────────────────────────────────────

export type FileEntry = {
	name: string;
	size: number;
	isFolder: boolean;
};

export type DownloadTask = {
	remote: string;
	local: string;
	size: number;
};

// ── Utilities ─────────────────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

/** Normalises a remote path to always end with a slash. */
export function remoteBase(remotePath: string): string {
	return remotePath.endsWith('/') ? remotePath : remotePath + '/';
}

// ── FTP operations ────────────────────────────────────────────────────────────

/**
 * Lists log files and folders in the given remote directory.
 * For folders, the reported size is the sum of all files inside them.
 */
export async function listRemoteFiles(
	client: FTPClient,
	remotePath: string,
): Promise<FileEntry[]> {
	const base = remoteBase(remotePath);
	const entries = await client.list(base);
	const filtered = entries.filter(
		(f: FileInfo) =>
			!f.name.startsWith('.') &&
			(f.isDirectory || LOG_EXTENSIONS.some(ext => f.name.endsWith(ext))),
	);

	const rows: FileEntry[] = [];
	for (const item of filtered) {
		if (item.isDirectory) {
			let totalSize = 0;
			try {
				const sub = await client.list(base + item.name);
				for (const f of sub.filter((f: FileInfo) => f.isFile)) totalSize += f.size;
			} catch {}

			rows.push({name: item.name, size: totalSize, isFolder: true});
		} else {
			rows.push({name: item.name, size: item.size, isFolder: false});
		}
	}

	return rows;
}

/**
 * Resolves the full list of download tasks for the selected files/folders,
 * then filters out any that are already present locally at the correct size.
 * Returns the tasks to run and the number of skipped files.
 */
export async function buildDownloadTasks(
	client: FTPClient,
	files: FileEntry[],
	base: string,
	outputDir: string,
): Promise<{tasks: DownloadTask[]; skipped: number}> {
	if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, {recursive: true});

	const all: DownloadTask[] = [];
	for (const file of files) {
		if (file.isFolder) {
			const subFiles = await client.list(base + file.name);
			const localFolder = path.join(outputDir, file.name);
			if (!fs.existsSync(localFolder)) fs.mkdirSync(localFolder, {recursive: true});
			for (const sub of subFiles.filter((f: FileInfo) => f.isFile)) {
				all.push({
					remote: base + file.name + '/' + sub.name,
					local: path.join(localFolder, sub.name),
					size: sub.size,
				});
			}
		} else {
			all.push({
				remote: base + file.name,
				local: path.join(outputDir, file.name),
				size: file.size,
			});
		}
	}

	const tasks = all.filter(
		t => !fs.existsSync(t.local) || fs.statSync(t.local).size < t.size,
	);
	return {tasks, skipped: all.length - tasks.length};
}

