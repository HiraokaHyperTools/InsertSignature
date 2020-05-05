// called from open-attach.html



(async function () {
  const ul = document.querySelector("#attachment-list")
  ul.querySelectorAll("li").forEach(it => it.remove())

  const list = await browser.oabeApi.listAttachmentFromActiveMail()
  if (list.length === 0) {
    const li = document.createElement("li")
    li.textContent = "No attachment observed in active message."
    ul.appendChild(li)
    return
  }
  for (let attachment of list) {
    const li = document.createElement("li")
    {
      const anchor = document.createElement("a")
      anchor.href = "about:blank" // need a valid url in order to activate anchor's link
      anchor.textContent = attachment.name
      anchor.addEventListener("click", () => {
        browser.oabeApi.openAttachmentFromActiveMail({
          name: attachment.name
        })
        return false // won't open about:blank
      })
      li.appendChild(anchor)
    }
    ul.appendChild(li)
  }
}).apply(this)
