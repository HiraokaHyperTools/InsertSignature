// OpenAttachmentByExtension pimple module

(function () {
  const self = this;
  const { pimple } = this; // by declare-pimple.js

  // See https://github.com/Mparaiso/Pimple.js

  let activeMessageId;

  pimple.set('setActiveMessageId', pimple.protect(function (id) {
    activeMessageId = id;
  }));

  pimple.set('getAttachmentFileNamesInActiveMail', pimple.protect(async function () {
    const messageHeader = await browser.messages.getFull(activeMessageId);
    const { parts } = messageHeader.parts[0];
    return parts
      .filter(it => it.body === undefined)
      .map(it => it.name);
  }));

  pimple.set('openAttachmentByFileNameInActiveMail', function (pimple) {
    return async function (fileName) {
      return await browser.oabeApi.openAttachmentFromActiveMail(fileName);
    };
  });

}).apply(this);
