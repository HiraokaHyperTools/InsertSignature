var oabeApi = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    const { FileUtils } = ChromeUtils.import("resource://gre/modules/FileUtils.jsm")
    const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm")
    const newProcess = () => Components.classes["@mozilla.org/process/util;1"]
      .createInstance(Components.interfaces.nsIProcess)
    const newFilePicker = () => Components.classes["@mozilla.org/filepicker;1"]
      .createInstance(Components.interfaces.nsIFilePicker)

    const reduceAttachmentInfo = (attachment) => ({
      name: attachment.name,
      partID: attachment.partID,
      size: attachment.size,
      contentType: attachment.contentType,
    })

    const getAttachmentsInActiveMail = () => {
      const { currentAttachment, currentAttachments } = Services.wm.getMostRecentWindow("mail:3pane")
      return currentAttachment || currentAttachments
    }

    return {
      oabeApi: {
        // test:
        // await browser.oabeApi.openAttachmentFromActiveMail({name:"TB_1.dxf"})
        async openAttachmentFromActiveMail(filters) {
          const { messenger, setTimeout } = Services.wm.getMostRecentWindow("mail:3pane")
          const sleepAsync = (milli) => {
            return new Promise(resolve => {
              setTimeout(() => resolve(), milli)
            })
          }

          const { name, partID } = filters
          const hits = getAttachmentsInActiveMail()
            .filter(it => true
              && (!name || it.name === name)
              && (!partID || it.partID === partID)
            )

          const tmpDir = FileUtils.getDir('TmpD', [])

          const result = []

          for (let attachment of hits) {
            const sourceUri = attachment.uri ? attachment.uri : attachment.messageUri
            const saveFileName = attachment.displayName ? attachment.displayName : attachment.name

            const tempfile = messenger.saveAttachmentToFolder(
              attachment.contentType,
              attachment.url,
              encodeURIComponent(saveFileName),
              sourceUri,
              tmpDir
            )

            while (!tempfile.exists() || tempfile.fileSize !== attachment.size) {
              await sleepAsync(500)
            }

            const process = newProcess()
            process.init(tempfile)
            process.run(false, [], 0)

            result.push(Object.assign(
              reduceAttachmentInfo(attachment),
              {
                tempPath: `${tempfile.path}`,
                status: "launched"
              }
            ))
          }

          return result
        },

        // test:
        // await browser.oabeApi.listAttachmentFromActiveMail()
        async listAttachmentFromActiveMail() {
          return getAttachmentsInActiveMail()
            .map(it => reduceAttachmentInfo(it))
        },

        // test:
        // await browser.oabeApi.pickFile()
        async pickFile() {
          const nsIFilePicker = Components.interfaces.nsIFilePicker;
          const fp = newFilePicker()
          const { window } = Services.wm.getMostRecentWindow("mail:3pane")
          fp.init(window, "OpenAttachmentByExtension", nsIFilePicker.modeOpen)
          fp.appendFilters(nsIFilePicker.filterAll)
          const asyncOpen = new Promise((resolve, reject) => {
            fp.open(function (rv) {
              if (rv == nsIFilePicker.returnOK) {
                resolve(fp.file.path)
              }
              else {
                reject(new Error("User cancel"))
              }
            })
          })
          return await asyncOpen
        },

        // test:
        // await browser.oabeApi.pickDir()
        async pickDir() {
          const nsIFilePicker = Components.interfaces.nsIFilePicker;
          const fp = newFilePicker()
          const { window } = Services.wm.getMostRecentWindow("mail:3pane")
          fp.init(window, "OpenAttachmentByExtension", nsIFilePicker.modeGetFolder)
          fp.appendFilters(nsIFilePicker.filterAll)
          const asyncOpen = new Promise((resolve, reject) => {
            fp.open(function (rv) {
              if (rv == nsIFilePicker.returnOK) {
                resolve(fp.file.path)
              }
              else {
                reject(new Error("User cancel"))
              }
            })
          })
          return await asyncOpen
        },
      }
    }
  }
}
