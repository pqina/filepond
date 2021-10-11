name: Bug report
about: Create a report to help us improve
title: "[BUG] <title>"
labels: ["bug"]
body:
- type: markdown
  attributes:
    value: |
      Thanks for taking the time to fill out this bug report!
- type: checkboxes
  attributes:
    label: Is there an existing issue for this?
    description: Please search to see if an issue already exists for the bug you encountered.
    options:
    - label: I have searched the existing issues
      required: true
- type: checkboxes
  attributes:
    label: Have you tested with the latest version of FilePond?
    options:
    - label: I have tested with the latest version
      required: true
- type: textarea
  attributes:
      label: Describe the bug
    description: A concise description of what you're experiencing.
  validations:
    required: true
- type: textarea
  attributes:
    label: Expected Behavior
    description: A concise description of what you expected to happen.
  validations:
    required: false
- type: textarea
  attributes:
      label: How to reproduce
    description: Please describe which steps to take to reproduce the problem. If possible please [fork this template on Codesandbox](https://codesandbox.io/s/filepond-plain-javascript-24i1m) and create a test project, this helps speed up the process of fixing the issue.
    placeholder: |
      1. On this browser...
      2. With this config...
      3. Follow these steps...
      4. See error...
  validations:
    required: true
- type: textarea
  attributes:
    label: Environment
    description: |
      examples:
        - **Browser**: Chrome 52.1, Firefox 48.0, IE 11
        - **OS**: MacOS 10, Ubuntu Linux 19.10, Windows 10
        - **Device**: iOS 15, Android 8.0
    value: |
        - Browser:
        - OS:
        - Device:
    render: markdown
  validations:
    required: true
