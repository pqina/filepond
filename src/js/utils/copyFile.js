import { renameFile } from './renameFile';
export const copyFile = file => renameFile(file, file.name);
