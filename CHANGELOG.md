# Changelog

## 4.30.6

-   Fix issue where using a number as source for a local file would throw a `url.split` error.

## 4.30.5

-   Fix file field value assignment #905

## 4.30.4

-   Fix a bug where the selected file is not replaced #841
-   Fix a bug where the onwarning event is not triggered #839
-   Add more translations

## 4.30.3

-   Fix accidental push.

## 4.30.2

-   Remove accidental log statement.

## 4.30.1

-   Prioritize server prop before other props when passed to setOptions #606

## 4.30.0

-   Add `labelFileSizeBytes`, `labelFileSizeKilobytes`, `labelFileSizeMegabytes`, `labelFileSizeGigabytes` #763

## 4.29.1

-   Revert chunked uploads #757

## 4.29.0

-   Enable rejecting images with an error message using the internal `DID_LOAD_ITEM` hook.

## 4.28.2

-   Fix issue where local server files could not be re-uploaded after editing and did not trigger remove of source file.

## 4.28.1

-   Fix CSS error.

## 4.28.0

-   Add `storeAsFile` property, if set to `true` FilePond will attempt to store the file objects in file input elements allowing file submit along with parent form (no need for `server` property). **This only works if the browser [supports the DataTransfer constructor](https://caniuse.com/mdn-api_datatransfer_datatransfer), this is the case on Firefox, Chrome, Chromium powered browsers and Safari version 14.1 and higher.**
-   Switch to PostCSS for style output.

## 4.27.3

-   Fix issue with file.js component leaking state causing `allowRemove` to impact other instances of FilePond. #713

## 4.27.2

-   Fix issue with fetch and `HEAD` no setting server id to hidden input element.

## 4.27.1

-   Fix issue with `allowMinimumUploadDuration` set to `false` throwing error.

## 4.27.0

-   Add `allowMinimumUploadDuration` set to `false` to prevent a minimum upload time of 750ms.

## 4.26.2

-   `setMetadata` internal `silent` bool now does fire internal `DID_UPDATE_ITEM_METADATA` but doesn't trigger upload or file prepare logic. This fixes an issue with the new image editor and file poster plugins.

## 4.26.1

-   Add metdata change info to internal `SHOULD_PREPARE_OUTPUT` call

## 4.26.0

-   Fix problem with rendering 0 items per row. #676
-   The `headers` property of the `server.process` end point can now be a function.

## 4.25.3

-   Fix issue with `chunkRetryDelays`. #671

## 4.25.2

-   Fix issue with fixed with file items not row wrapping correctly. #653
-   Fix file info label when remove button positioned to the right. #620

## 4.25.1

-   Renamed `beforePrepareOutput` hook to `beforePrepareFile`.

## 4.25.0

-   Add `beforePrepareOutput` hook to intercept and prevent preparing a new output file.

## 4.24.0

-   Add action info to internal `SHOULD_PREPARE_OUTPUT` call
-   Moved edit button CSS to FilePond

## 4.23.1

-   When files are dropped in a folder the file type cannot always be determined, this fix prevents FilePond from creating a Blob if it can't guesstimate the file type.

## 4.23.0

-   Add "powered by" footer and [credits prop](https://pqina.nl/filepond/docs/patterns/api/filepond-instance/#disabling-credits).

## 4.22.1

-   Fix problem with locale files.

## 4.22.0

-   Add internal filter for plugins to manipulate dropped files before adding them to the files list.

## 4.21.1

-   Fix calculation of file size when `fileSizeBase` is set to 1024.

## 4.21.0

-   Add `fileSizeBase` use to adjust the way files sizes are displayed. Default is `1000`.

## 4.20.1

-   Add `allowRemove` option so it actually works.

## 4.20.0

-   Add `allowRemove`, set to `false` to disable remove button.
-   Improve TypeScript definitions.
-   Fix issue where `removeFiles` would not remove all files.

## 4.19.2

-   Fix problem with locale files not ending up on npm.

## 4.19.1

-   Fix issue where removal of a server file was requested when setting new files to the `files` property.

## 4.19.0

-   Add locale folder, can now import different locales.
-   Improve `supports` method, now correctly detects MacOS Safari 8.
-   Improve type definitions file.
-   Fix issue with `removeFiles({ revert: false })` not working.
-   Fix issue where content pasted in a textarea would be interpreted as a file.

## 4.18.0

-   Add fallback for `fetch` when loading remote URLs, if no custom fetch supplied, will use default request.
-   Add TypeScript dynamic label types.
-   Fix issue where order of files wasn't correct when setting initial files.

## 4.17.1

-   Fix issue where reorder event was fired on each drag interaction, now only fires when order changes.

## 4.17.0

-   Add `allowProcess`, set to `false` to remove processing button and related abort / retry processing controls.
-   Fix issue where hidden inputs didn't reflect visual order of files in list.

## 4.16.0

-   Add `allowSyncAcceptAttribute`, set to `false` to prevent FilePond from setting the file input field `accept` attribute to the value of the `acceptedFileTypes`.

## 4.15.1

-   Fix issue with abort being called even when not supplied.

## 4.15.0

-   Add support for reording items in grid layout. Thanks @jwsinner ❤︎

## 4.14.0

-   Add `oninitfile`, called when file is first initialised, can be used to immediately set metadata.

## 4.13.7

-   Fix backwards compatibility problem with `4.13.5` and `4.13.6` where removeFile would revert upload.
-   Add `{ revert: true }` as parameter to `removeFile` and `removeFiles` methods. Where in the previous two fix versions reverting was added to be done automatically this new parameter now needs be set to revert the upload.

## 4.13.6

-   Fix problem where revert wasn't called for user added files.

## 4.13.5

-   Fix trigger of revert handler to `removeFile` API.
-   Fix problem where circular layout wouldn't work on latest Safari.

## 4.13.4

-   Fix issue where FilePond internal event mechanism would be in slowmotion mode when running in an inactive tab because of `setTimeout` use.

## 4.13.3

-   Fix issue where FilePond would excessivly pause in between processing files while running in an inactive tab.

## 4.13.2

-   Fix issue where FilePond running in an inactive tab would be very slow to pick up new files.

## 4.13.1

-   Fix issue where HEAD fetch request would try turn response into zero byte file.

## 4.13.0

-   Fix issue where hidden file fields were not in the correct order when files were sorted either automatically or manually.
-   Clean up accidental log statement left in 4.12.2 release.

## 4.12.2

-   Fix issue with re-enabling FilePond field from disabled state not applying the appropriate fields to the browse input.

## 4.12.1

-   Fix issue where browse button wasn't clickable when `styleLayoutMode` was set to `compact`.

## 4.12.0

-   Add `styleButtonRemoveItemAlign` to align remove button to the left side of the file item.
-   Fix issue where list of files could not be scrolled when FilePond was disabled.

## 4.11.0

-   Add `relativePath` property to file item.
-   Add `onreorderfiles` callback.
-   Fix issue where unkown type was `"null"` instead of an empty string.
-   Fix issue where `onactivatefile` was fired on drag end.

## 4.10.0

-   Copy webkitDirectory property to file object.

## 4.9.5

-   Fix issue with error format in TypeScript types.

## 4.9.4

-   Fix problem with API querystring containing multiple questionmarks.

## 4.9.3

-   Fix problem where ending the class attribute on a space would throw an error.

## 4.9.2

-   Add `grab` cursor to items so there's and indicator that items are grabbable.

## 4.9.1

-   Fix issue where Chrome on Android would launch pull-to-refresh when trying to drag a file item.

## 4.9.0

-   Add drag to reorder file items, enable by setting `allowReorder` to `true`.
    -   Only works in single column mode (for now).
    -   It also works when the list of files is showing a scrollbar, but dragging + scrolling isn't working correctly at the moment.
    -   Limited to [browsers supporting Pointer events](https://caniuse.com/#feat=pointer).
-   Add `moveFile(query, index)` method. Use to move a file to a different index in the file items array.

## 4.8.2

-   Fix problem with 4.8.1 fix not working with SSR.

## 4.8.1

-   Fix IE issue where adding markup would not work.

## 4.8.0

-   Add `prepareFile` and `prepareFiles` methods to the FilePond instance, use to request output files of the current items in the files list.

## 4.7.4

-   UTF-8 encode request headers to prevent issues with weird characters.

## 4.7.3

-   Switch from `setAttribute` to `cssText` for layout changes resulting in better performance and CSP compatibility. [#400](https://github.com/pqina/filepond/pull/400)

## 4.7.2

-   Fix issue where iOS 10 would throw an error when calling `delete` on a dataset property
-   Fix issue with `onwarning` being called on incorrect element

## 4.7.1

-   Fix problem where directories with over 100 files weren't read correctly.

## 4.7.0

-   Add support for [chunked uploads](https://pqina.nl/filepond/docs/patterns/api/server/#process-chunks). Thanks to Ryan Olson (@ams-ryanolson) Arctic Media for donating the funds to build this.

## 4.6.1

-   Add missing Blob type to TypeScript server config.

## 4.6.0

-   Add TypeScript declarations.

## 4.5.2

-   If `Blob` has `name` attribute use name attribute instead of URL for file name.

## 4.5.1

-   Fix issue where drag-drop from Firefox download list would not add file to drop area

## 4.5.0

-   Add option to set server end point headers on a generic level so they're applied to all end points using `server.headers`.

## 4.4.13

-   Fix problem with CSS overriding image preview markup text size.

## 4.4.12

-   Fix memory leak.

## 4.4.11

-   Fix problem with abort statement in file loader logic.

## 4.4.10

-   Fix issue where Promise returned by `addFile` would not be rejected if file failed to load.

## 4.4.9

-   Fix security issues with dependencies.

## 4.4.8

-   Fix issue where multiple calls to `setMetadata` would result in multiple successive calls to prepare file.
-   Fix issue where drop area aspect ratio would not update correctly on resize.

## 4.4.7

-   Fix issue where pasting a file would throw an error.
-   Fix issue where ignored files would be counted as files when dropping a folder.

## 4.4.6

-   Fix issue where `processFiles` would re-process `local` server images.

## 4.4.5

-   Fix issue where FilePond event loop would freeze when tab was inactive.

## 4.4.4

-   Fix issue where FilePond would not render when hidden, resulting in missing input elements and events not firing.

## 4.4.3

-   Fix issue where processing the queue didn't work correctly when files were removed while being in the queue.

## 4.4.2

-   Fix issue where UTF-8 encoded filename was not parsed correctly.

## 4.4.1

-   Fix issue where `Content-Disposition` header filename was not parsed correctly.

## 4.4.0

-   Fix issue where `addFile` did not respect `itemInsertLocation` setting.
-   Add the `beforeDropFile` hook which can be used to validate a dropped item before it's added, make sure `dropValidation` is set to `true` as well.

## 4.3.9

-   Fix problem where enabling FilePond after being `disabled` would not allow browsing for files.

## 4.3.8

-   Improve accessibility of buttons by moving label from `title` to inner hidden `<span>`.

## 4.3.7

-   Attempt #2 at fixing the issue of release `4.3.6`.

## 4.3.6

-   Fix problem where the `abortAll` call triggered when destroying FilePond would inadvertently trigger the `server.remove` end point for each local file.

## 4.3.5

-   Fix issue where changing the `stylePanelAspectRatio` would not update the container size.

## 4.3.4

-   Add source code.
-   Add build scripts.
-   Fix `onremovefile` callback not receiving an error object similar to `onaddfile`.

## 4.3.3

-   Fix issue where aborting a file load while the file was being prepared (for instance, encoded) did not work.

## 4.3.2

-   Fix issue where 0 byte files would not upload to the server.

## 4.3.1

-   Add `status` property to the FilePond instance, use this property to determine the current FilePond status (`EMPTY`, `IDLE`, `ERROR`, `BUSY`, or `READY`).

## 4.3.0

-   Fix problem where `addFiles` would not correctly map passed options to files.
-   Fix problem where upload error would prevent processing of other files.
-   Fix problem where the field would not "exist" if it had no value. Now if FilePond is empty the internal file input element is given the name attribute, this is removed when a file is added (as the name is then present on the file's hidden input element).
-   Add `onprocessfiles` which is called when all files have been processed.
-   Add `onactivatefile` which is called when a user clicks or taps on a file item.

## 4.2.0

-   Add `disabled` property, can be set as an attribute on the file input or as a property in the FilePond options object.
-   Add catching clicks on the entire pond label element to make it easier to click the label.

## 4.1.4

-   Only hide preview images when resizing the window horizontally, fixes problem with resize events on iOS.

## 4.1.3

-   Improve the way that FilePond resumes drawing when a tab retains focus.

## 4.1.2

-   Fix problem where `onaddfile` callback parameters were reversed when file validation plugins prevented file load

## 4.1.1

-   Fix problem where error shake animation would mess up preview image.

## 4.1.0

-   Add `itemInsertLocationFreedom` property, set to `false` to stop user from picking the location in the file list where the file is added.

## 4.0.2

-   Fix problem with undefine `ItemStatus` object in `processFiles` method

## 4.0.1

-   Fix problem where window resize handler was removed incorrectly resulting in an error.

## 4.0.0

Multiple improvements, small fixes and new features. As updating will result in animation speed changes, changes to the way files are added to the files list, and will require an update of the image preview plugin, the version has been bumped to 4.0.0

-   Add grid layout feature. Assign a fixed width to a filepond item and FilePond will render the items in rows.

The code below will render a list view on small viewports, a 50/50 grid on medium viewports, and a 33/33/33 grid on wide viewports. The `.5em` in each calc statement is equivalent to the combined left and right margin of each filepond item.

```css
@media (min-width: 30em) {
    .filepond--item {
        width: calc(50% - 0.5em);
    }
}

@media (min-width: 50em) {
    .filepond--item {
        width: calc(33.33% - 0.5em);
    }
}
```

-   Add `styleItemPanelAspectRatio` to control the item panel aspect ratio and render item panels in a fixed size.
-   Add `sort` method on FilePond instance for sorting FilePond files.
-   Add `itemInsertLocation` property to set default insert location of files or sort method.
-   Add `itemInsertInterval` to control the small delay between adding items to the files list.
-   Improve drag and drop performance.
-   Improve file insert logic and performance.
-   Improve rendering of file previews will now scale correctly when window is resized.
-   Improve handling of dropped directories on Firefox, file type was missing, now guestimates file type based on file extension.
-   Small tweaks and changes to file animation durations and intros.
-   Fixed drag coordinates being slightly out of place.
-   Multiple small fixes and code improvements.

## 3.9.0

-   Add `checkValidity` which is set to `false` by default. If it's set to `true`, FilePond will set the contents of the `labelInvalidField` property as the field custom validity message if it contains invalid files (files that for instance exceed max file size or fail other tests).

## 3.8.2

-   Fix problem where remove server error message was passed directly to client without label. Set `labelFileRemoveError` to a string to change default error, set it to a function to show custom server error. `{ labelFileRemoveError: serverError => serverError }`

## 3.8.1

-   Expose `dispatch` call to plugin item extensions.

## 3.8.0

-   Add `forceRevert` option, set to `true` to force a revert action to finish before continuing.

## 3.7.7

-   Improve `onlistupdate` event so it can be better synced with adapter components.

## 3.7.6

-   Switched browse text underline to `text-decoration-skip-ink: auto` instead of `text-decoration-skip: ink` to prevent eslint warnings.

## 3.7.5

-   Fix problem where calling `processFiles` without arguments would re-process already processed files.

## 3.7.4

-   Fix problem where subsequent calls to `processFile` would not automatically revert an uploaded file or abort an active upload.

## 3.7.3

-   Fix problem where upload complete indicator would not show when image preview was active.

## 3.7.2

-   Expose `createItemAPI` to plugins.

## 3.7.1

-   Fix problem where URLs would immidiately be in processed state.

## 3.7.0

-   Add `maxParallelUploads` option to limit the amount of files being uploaded in parallel.
-   Add option to only fetch file head when downloading remote URLs. File is downloaded to the server and server sends a unique file id to the client. Set `server.fetch.method` to `'HEAD'` the server needs to repond with custom header `X-Content-Transfer-Id` and a unique id. See [handle_fetch_remote_file](https://github.com/pqina/filepond-server-php/blob/master/index.php#L91) in FilePond PHP Server for an example implementation.

## 3.6.0

-   Add support for uploading transform plugin variants.
-   Add `server.process.ondata` which allows adding entries to the formdata before it's sent to the server.

## 3.5.1

-   Fix problem where `processFile` and `processFiles` would reprocess already processed files.

## 3.5.0

-   Add `beforeAddFile` hook, this can be used to quickly validate files before they're being added.

## 3.4.0

-   Add `server.remove` property, this property can be optionally set to a method to call when the remove button is tapped on a `local` file. This allows removing files from the server. Please note that allowing clients to remove files from the server is a potential security risk and requires extra caution.

By default the property is `null`. The advise is to not use this method and only make changes to the server after the parent form has been submitted. The form POST will contain all the loaded file names and relevant file data, it should be enough to determine the files to remove and the files to keep.

## 3.3.3

-   Fix filename matching of content-disposition header when the filename is not wrapped in quotes.
-   Fix problem where special characters in filename prevented a file from being added

## 3.3.2

-   Fix problem where revert call would revert wrong file item.

## 3.3.1

-   Fix problem where exceeding the max file limit would not throw an error

## 3.3.0

-   Add feature to silently update metadata so it doesn't trigger an update.

## 3.2.5

-   Fix issue where items would be removed before item sub views were all in rest state.

## 3.2.4

-   Fix problem where server side rendering would not work correctly.

## 3.2.3

-   Fix problem where `beforeRemoveFile` hook was not called when in `instantUpload` mode and reverting an upload.

## 3.2.2

-   Add preparations for queueing file processing.
-   Improve guards against errors when items are removed.
-   Improve alignment of drop label.

## 3.2.1

-   Group updateitems callback for better compatibility with React.

## 3.2.0

-   Add global scoped property for painter so multiple libraries can subscribe to read and write DOM operations. This is mostly in preparation for a standalone version of the Image Editor plugin.

## 3.1.6

-   Fix problem where remove callback would no longer work.

## 3.1.5

-   Fix problem with WebWorkers not working correctly on Edge and IE.

## 3.1.4

-   Fix syntax error [#147](https://github.com/pqina/filepond/pull/147)

## 3.1.3

-   Fix additional problem with quick file removals.

## 3.1.2

-   Fix problem where remove call would throw error depending on the state of the upload.
-   Fix problem where clicking on abort before upload had started would not cancel upload.

Please note that this update will require installing new versions of the following plugins:

-   File Validate Size

## 3.1.1

-   Fix problem where panel overflow would render incorrectly.

## 3.1.0

-   Improve diffing when updating the `files` property.
-   Add `onupdatefiles` callback that is triggered when a file is added or removed to a pond instance.

## 3.0.4

-   Fix problem where feature detection would throw error on iOS 8.x

## 3.0.3

-   Fix problem with XMLHttpRequest timeout on Internet Explorer 11.
-   Fix problem with custom properties on element on Internet Explorer 11.

## 3.0.2

-   Fix problem with label not being clickable while in integrated layout mode.

## 3.0.1

-   Fix problem where timeout would incorrectly trigger for uploads.

## 3.0.0

-   Small internal flow changes to facilitate integration with the Image Editor plugin
-   Improve performance
-   Improve file loader so it now supports `blob` URLs
-   Add `stylePanelLayout` setting to set layout mode for panel
-   Add `stylePanelAspectRatio` setting to fix aspect ratio of panel
-   Add `styleButtonRemoveItemPosition` to control remove button position on image preview
-   Add `styleButtonProcessItemPosition` to control item processing position on image preview
-   Add `styleLoadIndicatorPosition` to control load indicator position on image preview
-   Add `styleProgressIndicatorPosition` to control process indicator position on image preview
-   Add method to automatically update data when file metadata is updated
-   Fix animation rest state detection

Please note that this update will require installing new versions of the following plugins:

-   File Encode
-   Image Crop
-   Image Preview
-   Image Transform

## 2.3.1

-   Fix improved browser environment detection.

## 2.3.0

-   Improve browser environment detection [#123](https://github.com/pqina/filepond/pull/123).
-   Add `beforeRemoveFile` callback to allow user confirmation before actual file removal.

## 2.2.1

-   Fix another problem where list overflow would not render correctly.

## 2.2.0

-   Fix problem where `maxFiles` was not enforced when dropping a set of files, each file was added in sequence till `maxFiles` was reached while the set as a whole should've been invalidated at once.

## 2.1.3

-   Fix problem where max-height of filepond root would not be respected by file list.

## 2.1.2

-   Cleaned up some stray babelHelpers.
-   Fix bug in render engine style method, should result in less unnecessary redraws.

## 2.1.1

-   Fix problem where the drop indicator would render at the wrong location.
-   Fix problem where calling `removeFile` directly after `processFile` was resolved would throw an error.

## 2.1.0

-   Labels can now be set as functions, these functions will receive context information, this is useful to customize both he load error and processing error labels based on server response.

## 2.0.1

-   Add additional utilities to plugin API.

## 2.0.0

-   Automatically replace undo button counterclockwise arrow icon with remove button icon when `instantUpload` is set to `true`.

## 1.8.8

-   Add `metadata` handling to `addFile` method.

## 1.8.7

-   Fix problem where setting `allowRevert` to `false` would hide the remove button.

## 1.8.6

-   Fix problem where adding dataURIs would throw an error

## 1.8.5

-   Fix casting of input attributes without value to correct boolean

## 1.8.4

-   Fix problem where response timeout would throw an error
-   Improve handling of returned value by processing onload function

## 1.8.3

-   Cleaning up some stray code

## 1.8.2

-   Fix problem where element options did not override page level options

## 1.8.1

-   Handle `Blob` with `name` property same as actual `File` object
-   Attempt to fix a problem where `elementFromPoint` could not be found in Angular component

## 1.8.0

-   Add view filter to file info view
-   Add option to [mock server files](https://pqina.nl/filepond/docs/patterns/api/filepond-object/#creating-a-filepond-instance)
-   Add option to [set initial file metadata](https://pqina.nl/filepond/docs/patterns/api/filepond-object/#creating-a-filepond-instance) for server files
-   Bugfixes

## 1.7.4

-   Fix handling of `Content-Disposition` header to better extract the filename

## 1.7.3

-   Events are now fired asynchronous, this allows internal processes to finish up

## 1.7.2

-   Fix broken links in README

## 1.7.1

-   Add view filter to file status view
-   Fix problem where attribute object value was not read correctly

## 1.7.0

-   Add `onerror` callback to server configuration to allow custom parsing of error response

## 1.6.2

-   Fix problem where restored temp file would not be removed correctly

## 1.6.1

-   Add `FileOrigin` enum to FilePond object

## 1.6.0

-   Add `fileOrigin` property to file item

## 1.5.4

-   Update README with links to new plugins and adapters

## 1.5.3

-   Accidentally skip over this version number

## 1.5.2

-   Remove max-width on file status view

## 1.5.1

-   Prevent text wrapping for file size label

## 1.5.0

-   Add `onload` method to server configuration

## 1.4.1

-   Fix progress indicator getting stuck on subsequent uploads

## 1.4.0

-   Add `allowRevert` option to disable revert button

## 1.3.0

-   Add `dropValidation` option to enable pre-validating of dropped items

## 1.2.11

-   Improve timing of CPU heavy operations (like file encoding) when a file is added to FilePond

## 1.2.10

-   Fix `removeFiles` method. Did not correctly remove files when called with empty arguments or an array of indexes

## 1.2.9

-   Fix bug where `processFiles` only worked when receiving parameters

## 1.2.8

-   Tiny improvements so can be used when server side rendering

## 1.2.7

-   Improve loading indicator state
-   Add Angular adapter reference to README

## 1.2.6

-   Add `onprocessfile` callback to options object

## 1.2.5

-   Fix id attribute not being available on FilePond root
-   Fix FilePond not rendering correctly when initially hidden
-   Improve render performance

## 1.2.4

-   Fix `setOptions` method not correctly converting value types

## 1.2.3

-   Update the `OptionTypes` property when a plugin is registered

## 1.2.2

-   Fix `setOptions` returning an incorrectly formatted options object

## 1.2.1

-   Add README link to backlog on WIP
-   Fix problem where `destroy` would not remove FilePond
-   Switch license from GPL to MIT
-   Add jQuery to adapters list
-   Fix error message animation
-   Improve FilePond event parameters

## 1.1.0

-   Accidentally skip version 1.1.0

## 1.0.8

-   Fix problem where plugins could be registered twice
-   Improve `files` property, now compares existing files against new files and updates accordingly

## 1.0.7

-   Hide center panel before scaling panel view

## 1.0.6

-   Improve style possibilities for panel views and enforce internal panel layout properties

## 1.0.5

-   Fix problem where loading indicators would not spin for certain requests
-   Various improvements to README

## 1.0.4

-   Fix render bugs
-   Improve panel view layout

## 1.0.3

-   Fix processing complete state file item color

## 1.0.2

-   Add support for client side file manipulation
-   Add support for file metadata
-   Improve performance

## 1.0.1

-   Add correct banners to library files

## 1.0.0

-   Initial release
