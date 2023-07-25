browser.runtime.onMessage.addListener((options, sender) => {
    if (options.text) {
        if(options.isHTML) {
            document.execCommand("insertHtml", false, options.text);
        }
        else {
            document.execCommand("insertText", false, options.text);
        }
    }
    return Promise.resolve({});
});
