import * as FilePond from 'filepond';

const pond1 = FilePond.create();
const pond2 = FilePond.create('eeee')
const pond = FilePond.create(undefined, {
  name: "",
  files: [{
    source: "123",
    options: {
      type: "limbo"
    }
  }]
})




