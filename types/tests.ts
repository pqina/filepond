import * as FilePond from 'filepond';

const pond1 = FilePond.create();
const pond2 = FilePond.create(new Element())
const pond = FilePond.create(undefined, {
  name: "",
  files: [{
    source: "123",
    options: {
      type: 'limbo'
    }
  }],
  server: {
    process: (fieldName, file, metadata, load, error, progress, abort) => {
      return {
        abort: () => {abort();}
      }
    }
  },
  itemInsertLocation: (a, b) => {

    // If no file data yet, treat as equal
    if (!(a.file && b.file)) return 0;
    
    // Move to right location in list
    if (a.fileSize < b.fileSize) {
        return -1;
    }
    else if (b.fileSize > a.fileSize) {
        return 1;
    }

    return 0;
}
})

pond.itemInsertLocation = (a, b) => {

  // If no file data yet, treat as equal
  if (!(a.file && b.file)) return 0;
  
  // Move to right location in list
  if (a.fileSize < b.fileSize) {
      return -1;
  }
  else if (b.fileSize > a.fileSize) {
      return 1;
  }

  return 0;
}

pond.addEventListener('FilePond:addfile', e => {
  console.log(e.detail);
})

const data = { hello: 'world' };
const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
});
pond.addFile(blob);

const file = new File(["aaaa"], "something")
pond.addFile(file);
pond.addFile('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==')
pond.addFile('./my-file.jpg').then(file => {
  pond.removeFile(file);
});

pond.on('addfile', (error, file) => {
  if (error) {
      console.log('Oh no');
      return;
  }
  console.log('File added', file);
});

// $ExpectType Status
let status = pond.status







