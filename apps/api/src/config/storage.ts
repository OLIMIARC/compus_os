import path from 'path';
import fs from 'fs';
import { config } from './env';

export interface StorageConfig {
    baseDir: string;
    notesDir: string;
    memesDir: string;
    tempDir: string;
}

export const storageConfig: StorageConfig = {
    baseDir: path.resolve(config.upload.dir),
    notesDir: path.resolve(config.upload.dir, 'notes'),
    memesDir: path.resolve(config.upload.dir, 'memes'),
    tempDir: path.resolve(config.upload.dir, 'temp'),
};

// Ensure upload directories exist
export function ensureUploadDirectories() {
    const dirs = [
        storageConfig.baseDir,
        storageConfig.notesDir,
        storageConfig.memesDir,
        storageConfig.tempDir,
    ];

    dirs.forEach((dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📁 Created directory: ${dir}`);
        }
    });
}

export function getFilePath(type: 'note' | 'meme' | 'temp', filename: string): string {
    switch (type) {
        case 'note':
            return path.join(storageConfig.notesDir, filename);
        case 'meme':
            return path.join(storageConfig.memesDir, filename);
        case 'temp':
            return path.join(storageConfig.tempDir, filename);
        default:
            throw new Error(`Unknown file type: ${type}`);
    }
}
