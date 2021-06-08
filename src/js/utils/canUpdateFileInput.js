let res = null;
export const canUpdateFileInput = () => {
    if (res === null) {
        try {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(new File(['hello world'], 'This_Works.txt'));
            const el = document.createElement('input');
            el.setAttribute('type', 'file');
            el.files = dataTransfer.files;
            res = el.files.length === 1;
        } catch (err) {
            res = false;
        }
    }
    return res;
};
