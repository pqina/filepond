let testResult = null;
export const isIOS = () => {
    if (testResult === null) {
        testResult = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    return testResult;
}