export const getFileNameFromHeader = header => {

    // test if is content disposition header, if not exit
    if (!/^content-disposition:/i.test(header)) return null;

    // get filename parts
    const matches = header.split(/filename=|filename\*=.+''/)
        .splice(1)
        .map(name => name.trim().replace(/^["']|[;"']{0,2}$/g, ''))
        .filter(name => name.length)
    
    return matches.length ? decodeURI(matches[matches.length-1]) : null;
}

const getFileSizeFromHeader = header => {
    if (/content-length:/i.test(header)) {
        const size = header.match(/[0-9]+/)[0];
        return size ? parseInt(size, 10) : null;
    }
    return null;
}

const getTranfserIdFromHeader = header => {
    if (/x-content-transfer-id:/i.test(header)) {
        const id = (header.split(':')[1] || '').trim();
        return id || null;
    }
    return null;
}

export const getFileInfoFromHeaders = headers => {
    
    const info = {
        source: null,
        name: null,
        size: null
    };

    const rows = headers.split('\n');
    for (let header of rows) {

        const name = getFileNameFromHeader(header);
        if (name) {
            info.name = name;
            continue;
        }

        const size = getFileSizeFromHeader(header);
        if (size) {
            info.size = size;
            continue;
        }

        const source = getTranfserIdFromHeader(header);
        if (source) {
            info.source = source;
            continue;
        }

    }
    
    return info;
}