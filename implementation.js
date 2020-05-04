var oabeApi = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    const { FileUtils } = ChromeUtils.import("resource://gre/modules/FileUtils.jsm")
    const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm")
    const { messenger, currentAttachment, currentAttachments } = Services.wm.getMostRecentWindow("mail:3pane")
    const newProcess = () => Components.classes["@mozilla.org/process/util;1"]
      .createInstance(Components.interfaces.nsIProcess)

    return {
      oabeApi: {
        // test:
        // await browser.oabeApi.openAttachmentFromActiveMail("TB_1.dxf")
        async openAttachmentFromActiveMail(name) {
          const hits = (currentAttachment || currentAttachments)
            .filter(it => it.name === name)

          if (hits.length !== 1) {
            throw new Error(`Hit ${hits.length} attachments!`)
          }

          const attachment = hits[0]

          const tmpDir = FileUtils.getDir('TmpD', [])

          const openUri = attachment.uri ? attachment.uri : attachment.messageUri
          const attName = attachment.displayName ? attachment.displayName : attachment.name

          const tempfile = messenger.saveAttachmentToFolder(
            attachment.contentType,
            attachment.url,
            encodeURIComponent(attName),
            openUri,
            tmpDir
          )

          const process = newProcess()
          process.init(tempfile)
          process.run(false, [], 0)
        },
      }
    }
  }
}
