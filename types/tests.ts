import * as FilePond from 'filepond';

const pond1 = FilePond.create();
const pond2 = FilePond.create('<div></div>')
const pond = FilePond.create(undefined, {
  name: "",
  files: [{
    source: "123",
    options: {
      type: "limbo"
    }
  }],
  server: {
    process: (fieldName, file, metadata, load, error, progress, abort) => {
      return {
        abort: () => {abort();}
      }
    }
  } 
})
pond.isAttachedTo(new Element())




