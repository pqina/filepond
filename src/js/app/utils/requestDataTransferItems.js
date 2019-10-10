import { guesstimateMimeType } from '../../utils/guesstimateMimeType';
import { getExtensionFromFilename } from '../../utils/getExtensionFromFilename';

export const requestDataTransferItems = dataTransfer =>
    new Promise((resolve, reject) => {
        // try to get links from transfer, if found we'll exit immidiately (unless a file is in the dataTransfer as well, this is because Firefox could represent the file as a URL and a file object at the same time)
        const links = getLinks(dataTransfer);
        if (links.length && !hasFiles(dataTransfer)) {
            return resolve(links);
        }
        // try to get files from the transfer
        getFiles(dataTransfer).then(resolve);
    });

/**
 * Test if datatransfer has files
 */
const hasFiles = (dataTransfer) => {
    if (dataTransfer.files) return dataTransfer.files.length > 0;
    return false;
}


/**
 * Extracts files from a DataTransfer object
 */
const getFiles = dataTransfer =>
    new Promise((resolve, reject) => {

        // get the transfer items as promises
        const promisedFiles = (dataTransfer.items
            ? Array.from(dataTransfer.items)
            : []
        )

            // only keep file system items (files and directories)
            .filter(item => isFileSystemItem(item))

            // map each item to promise
            .map(item => getFilesFromItem(item));

        // if is empty, see if we can extract some info from the files property as a fallback
        if (!promisedFiles.length) {
            // TODO: test for directories (should not be allowed)
            // Use FileReader, problem is that the files property gets lost in the process

            resolve(dataTransfer.files ? Array.from(dataTransfer.files) : []);
            return;
        }

        // done!
        Promise.all(promisedFiles)
            .then(returnedFileGroups => {
                // flatten groups
                const files = [];
                returnedFileGroups.forEach(group => {
                    files.push.apply(files, group);
                });

                // done (filter out empty files)!
                resolve(files.filter(file => file));
            })
            .catch(console.error);
    });

const isFileSystemItem = item => {
    if (isEntry(item)) {
        const entry = getAsEntry(item);
        if (entry) {
            return entry.isFile || entry.isDirectory;
        }
    }
    return item.kind === 'file';
};

const getFilesFromItem = item =>
    new Promise((resolve, reject) => {

        if (isDirectoryEntry(item)) {
            getFilesInDirectory(getAsEntry(item))
                .then(resolve)
                .catch(reject)
            return;
        }

        resolve([item.getAsFile()]);
    });

const getFilesInDirectory = entry =>
    new Promise((resolve, reject) => {

        const files = [];

        // the total entries to read
        let dirCounter = 0;
        let fileCounter = 0;

        const resolveIfDone = () => {
            if (fileCounter === 0 && dirCounter === 0) {
                resolve(files);
            }
        }

        // the recursive function
        const readEntries = dirEntry => {

            dirCounter++;

            const directoryReader = dirEntry.createReader();

            // directories are returned in batches, we need to process all batches before we're done
            const readBatch = () => {

                directoryReader.readEntries(entries => {

                    if (entries.length === 0) {
                        dirCounter--;
                        resolveIfDone();
                        return;
                    }

                    entries.forEach(entry => {
    
                        // recursively read more directories
                        if (entry.isDirectory) {
                            readEntries(entry);
                        }
                        else {

                            // read as file
                            fileCounter++;

                            entry.file(file => {
                                files.push(correctMissingFileType(file));
                                fileCounter--;
                                resolveIfDone();
                            });

                        }
                    });

                    // try to get next batch of files
                    readBatch();

                }, reject);

            }

            // read first batch of files
            readBatch();
        };

        // go!
        readEntries(entry);
    });

const correctMissingFileType = (file) => {
    if (file.type.length) return file;
    const date = file.lastModifiedDate;
    const name = file.name;
    file = file.slice(0, file.size, guesstimateMimeType(getExtensionFromFilename(file.name)));
    file.name = name;
    file.lastModifiedDate = date;
    return file;
}

const isDirectoryEntry = item => isEntry(item) && (getAsEntry(item) || {}).isDirectory;

const isEntry = item => 'webkitGetAsEntry' in item;

const getAsEntry = item => item.webkitGetAsEntry();

/**
 * Extracts links from a DataTransfer object
 */
const getLinks = dataTransfer => {
    let links = [];
    try {
        // look in meta data property
        links = getLinksFromTransferMetaData(dataTransfer);
        if (links.length) {
            return links;
        }
        links = getLinksFromTransferURLData(dataTransfer);
    } catch (e) {
        // nope nope nope (probably IE trouble)
    }
    return links;
};

const getLinksFromTransferURLData = dataTransfer => {
    let data = dataTransfer.getData('url');
    if (typeof data === 'string' && data.length) {
        return [data];
    }
    return [];
};

const getLinksFromTransferMetaData = dataTransfer => {
    let data = dataTransfer.getData('text/html');
    if (typeof data === 'string' && data.length) {
        const matches = data.match(/src\s*=\s*"(.+?)"/);
        if (matches) {
            return [matches[1]];
        }
    }
    return [];
};
