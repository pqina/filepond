# Changelog

## 3.8.2

- Fix problem where remove server error message was passed directly to client without label. Set `labelFileRemoveError` to a string to change default error, set it to a function to show custom server error. `{ labelFileRemoveError: serverError => serverError }`


## 3.8.1

- Expose `dispatch` call to plugin item extensions.


## 3.8.0

- Add `forceRevert` option, set to `true` to force a revert action to finish before continuing.


## 3.7.7

- Improve `onlistupdate` event so it can be better synced with adapter components.


## 3.7.6

- Switched browse text underline to `text-decoration-skip-ink: auto` instead of `text-decoration-skip: ink` to prevent eslint warnings.


## 3.7.5

- Fix problem where calling `processFiles` without arguments would re-process already processed files.


## 3.7.4

- Fix problem where subsequent calls to `processFile` would not automatically revert an uploaded file or abort an active upload.


## 3.7.3

- Fix problem where upload complete indicator would not show when image preview was active.


## 3.7.2

- Expose `createItemAPI` to plugins.


## 3.7.1

- Fix problem where URLs would immidiately be in processed state.


## 3.7.0

- Add `maxParallelUploads` option to limit the amount of files being uploaded in parallel.
- Add option to only fetch file head when downloading remote URLs. File is downloaded to the server and server sends a unique file id to the client. Set `server.fetch.method` to `'HEAD'` the server needs to repond with custom header `X-Content-Transfer-Id` and a unique id. See [handle_fetch_remote_file](https://github.com/pqina/filepond-server-php/blob/master/index.php#L91) in FilePond PHP Server for an example implementation.


## 3.6.0

- Add support for uploading transform plugin variants.
- Add `server.process.ondata` which allows adding entries to the formdata before it's sent to the server.


## 3.5.1

- Fix problem where `processFile` and `processFiles` would reprocess already processed files.


## 3.5.0

- Add `beforeAddFile` hook, this can be used to quickly validate files before they're being added.


## 3.4.0

- Add `server.remove` property, this property can be optionally set to a method to call when the remove button is tapped on a `local` file. This allows removing files from the server. Please note that allowing clients to remove files from the server is a potential security risk and requires extra caution.

By default the property is `null`. The advise is to not use this method and only make changes to the server after the parent form has been submitted. The form POST will contain all the loaded file names and relevant file data, it should be enough to determine the files to remove and the files to keep.


## 3.3.3

- Fix filename matching of content-disposition header when the filename is not wrapped in quotes.
- Fix problem where special characters in filename prevented a file from being added


## 3.3.2

- Fix problem where revert call would revert wrong file item.


## 3.3.1

- Fix problem where exceeding the max file limit would not throw an error


## 3.3.0

- Add feature to silently update metadata so it doesn't trigger an update.


## 3.2.5

- Fix issue where items would be removed before item sub views were all in rest state.


## 3.2.4

- Fix problem where server side rendering would not work correctly.


## 3.2.3

- Fix problem where `beforeRemoveFile` hook was not called when in `instantUpload` mode and reverting an upload. 


## 3.2.2

- Add preparations for queueing file processing.
- Improve guards against errors when items are removed.
- Improve alignment of drop label.


## 3.2.1

- Group updateitems callback for better compatibility with React.


## 3.2.0

- Add global scoped property for painter so multiple libraries can subscribe to read and write DOM operations. This is mostly in preparation for a standalone version of the Image Editor plugin.


## 3.1.6

- Fix problem where remove callback would no longer work.


## 3.1.5

- Fix problem with WebWorkers not working correctly on Edge and IE.


## 3.1.4

- Fix syntax error [#147](https://github.com/pqina/filepond/pull/147)


## 3.1.3

- Fix additional problem with quick file removals.


## 3.1.2

- Fix problem where remove call would throw error depending on the state of the upload.
- Fix problem where clicking on abort before upload had started would not cancel upload.

Please note that this update will require installing new versions of the following plugins:
- File Validate Size


## 3.1.1

- Fix problem where panel overflow would render incorrectly.


## 3.1.0

- Improve diffing when updating the `files` property.
- Add `onupdatefiles` callback that is triggered when a file is added or removed to a pond instance.


## 3.0.4

- Fix problem where feature detection would throw error on iOS 8.x


## 3.0.3

- Fix problem with XMLHttpRequest timeout on Internet Explorer 11.
- Fix problem with custom properties on element on Internet Explorer 11.


## 3.0.2

- Fix problem with label not being clickable while in integrated layout mode.


## 3.0.1

- Fix problem where timeout would incorrectly trigger for uploads.


## 3.0.0

- Small internal flow changes to facilitate integration with the Image Editor plugin
- Improve performance
- Improve file loader so it now supports `blob` URLs
- Add `stylePanelLayout` setting to set layout mode for panel
- Add `stylePanelAspectRatio` setting to fix aspect ratio of panel
- Add `styleButtonRemoveItemPosition` to control remove button position on image preview
- Add `styleButtonProcessItemPosition` to control item processing position on image preview
- Add `styleLoadIndicatorPosition` to control load indicator position on image preview
- Add `styleProgressIndicatorPosition` to control process indicator position on image preview
- Add method to automatically update data when file metadata is updated
- Fix animation rest state detection

Please note that this update will require installing new versions of the following plugins:
- File Encode
- Image Crop
- Image Preview
- Image Transform


## 2.3.1

- Fix improved browser environment detection.


## 2.3.0

- Improve browser environment detection [#123](https://github.com/pqina/filepond/pull/123).
- Add `beforeRemoveFile` callback to allow user confirmation before actual file removal.


## 2.2.1

- Fix another problem where list overflow would not render correctly.


## 2.2.0

- Fix problem where `maxFiles` was not enforced when dropping a set of files, each file was added in sequence till `maxFiles` was reached while the set as a whole should've been invalidated at once.


## 2.1.3

- Fix problem where max-height of filepond root would not be respected by file list.


## 2.1.2

- Cleaned up some stray babelHelpers.
- Fix bug in render engine style method, should result in less unnecessary redraws.


## 2.1.1

- Fix problem where the drop indicator would render at the wrong location.
- Fix problem where calling `removeFile` directly after `processFile` was resolved would throw an error.


## 2.1.0

- Labels can now be set as functions, these functions will receive context information, this is useful to customize both he load error and processing error labels based on server response.


## 2.0.1

- Add additional utilities to plugin API.


## 2.0.0

- Automatically replace undo button counterclockwise arrow icon with remove button icon when `instantUpload` is set to `true`.


## 1.8.8

- Add `metadata` handling to `addFile` method.


## 1.8.7

- Fix problem where setting `allowRevert` to `false` would hide the remove button.


## 1.8.6

- Fix problem where adding dataURIs would throw an error


## 1.8.5

- Fix casting of input attributes without value to correct boolean


## 1.8.4

- Fix problem where response timeout would throw an error
- Improve handling of returned value by processing onload function


## 1.8.3

- Cleaning up some stray code


## 1.8.2

- Fix problem where element options did not override page level options


## 1.8.1

- Handle `Blob` with `name` property same as actual `File` object
- Attempt to fix a problem where `elementFromPoint` could not be found in Angular component


## 1.8.0

- Add view filter to file info view
- Add option to [mock server files](https://pqina.nl/filepond/docs/patterns/api/filepond-object/#creating-a-filepond-instance)
- Add option to [set initial file metadata](https://pqina.nl/filepond/docs/patterns/api/filepond-object/#creating-a-filepond-instance) for server files
- Bugfixes


## 1.7.4

- Fix handling of `Content-Disposition` header to better extract the filename

 
## 1.7.3

- Events are now fired asynchronous, this allows internal processes to finish up


## 1.7.2

- Fix broken links in README


## 1.7.1

- Add view filter to file status view
- Fix problem where attribute object value was not read correctly


## 1.7.0

- Add `onerror` callback to server configuration to allow custom parsing of error response


## 1.6.2

- Fix problem where restored temp file would not be removed correctly

## 1.6.1

- Add `FileOrigin` enum to FilePond object


## 1.6.0

- Add `fileOrigin` property to file item


## 1.5.4

- Update README with links to new plugins and adapters


## 1.5.3

- Accidentally skip over this version number


## 1.5.2

- Remove max-width on file status view


## 1.5.1

- Prevent text wrapping for file size label


## 1.5.0

- Add `onload` method to server configuration


## 1.4.1

- Fix progress indicator getting stuck on subsequent uploads


## 1.4.0

- Add `allowRevert` option to disable revert button


## 1.3.0

- Add `dropValidation` option to enable pre-validating of dropped items


## 1.2.11

- Improve timing of CPU heavy operations (like file encoding) when a file is added to FilePond

## 1.2.10

- Fix `removeFiles` method. Did not correctly remove files when called with empty arguments or an array of indexes


## 1.2.9

- Fix bug where `processFiles` only worked when receiving parameters


## 1.2.8

- Tiny improvements so can be used when server side rendering


## 1.2.7

- Improve loading indicator state
- Add Angular adapter reference to README


## 1.2.6

- Add `onprocessfile` callback to options object


## 1.2.5

- Fix id attribute not being available on FilePond root
- Fix FilePond not rendering correctly when initially hidden
- Improve render performance


## 1.2.4

- Fix `setOptions` method not correctly converting value types


## 1.2.3

- Update the `OptionTypes` property when a plugin is registered


## 1.2.2

- Fix `setOptions` returning an incorrectly formatted options object


## 1.2.1

- Add README link to backlog on WIP
- Fix problem where `destroy` would not remove FilePond
- Switch license from GPL to MIT
- Add jQuery to adapters list
- Fix error message animation
- Improve FilePond event parameters


## 1.1.0

- Accidentally skip version 1.1.0


## 1.0.8

- Fix problem where plugins could be registered twice
- Improve `files` property, now compares existing files against new files and updates accordingly


## 1.0.7

- Hide center panel before scaling panel view


## 1.0.6

- Improve style possibilities for panel views and enforce internal panel layout properties


## 1.0.5

- Fix problem where loading indicators would not spin for certain requests
- Various improvements to README


## 1.0.4

- Fix render bugs
- Improve panel view layout


## 1.0.3

- Fix processing complete state file item color


## 1.0.2

- Add support for client side file manipulation
- Add support for file metadata
- Improve performance


## 1.0.1

- Add correct banners to library files


## 1.0.0

- Initial release
