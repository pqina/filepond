export const setInputFiles = (element, files) => {
    try {
        // Create a DataTransfer instance and add a newly created file
        const dataTransfer = new DataTransfer();
        files.forEach(file => {
            if (file instanceof File) {
                dataTransfer.items.add(file);
            } else {
                dataTransfer.items.add(
                    new File([file], file.name, {
                        type: file.type,
                    })
                );
            }
        });

        // Assign the DataTransfer files list to the file input
        element.files = dataTransfer.files;
    } catch (err) {
        return false;
    }
    return true;
};
