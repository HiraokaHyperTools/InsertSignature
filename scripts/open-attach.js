// include from open-attach.html

(async function () {
  const ul = document.querySelector("#attachment-list")
  ul.querySelectorAll("li").forEach(it => it.remove())

  const list = await browser.oabeApi.listAttachmentFromActiveMail()
  for (let attachment of list) {
    const li = document.createElement("li")
    {
      const anchor = document.createElement("a")
      anchor.href = "https://yahoo.co.jp/"
      anchor.textContent = attachment.name
      anchor.addEventListener("click", () => {
        browser.oabeApi.openAttachmentFromActiveMail({
          name: attachment.name
        })
        return false
      })
      li.appendChild(anchor)
    }
    ul.appendChild(li)
  }
}).apply(this)
