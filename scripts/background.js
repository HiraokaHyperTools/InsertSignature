browser.messageDisplayAction.onClicked.addListener(async function (tab, info) {
  //console.info({ tab, info });
});
browser.messageDisplay.onMessageDisplayed.addListener(async function (tab, message) {
  //console.info({ tab, message });

  //const messageHeader = await browser.messages.getFull(message.id);
  //console.info({ messageHeader });

  pimple.setActiveMessageId(message.id);
});
