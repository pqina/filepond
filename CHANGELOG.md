# Changelog

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
