// called by inserter.html

import * as pref from './pref.js'
import pref2 from './pref2.js'
import * as utils from './utils.js'

let onSaveTemplateDetail
let onRemoveThisTemplateDetail

const titleEdit = $('#titleEdit')
const templateEdit = $('#templateEdit')
const templatesListView = $('#templatesListView')
const templatesInserterListView = $('#templatesInserterListView')

function refreshTemplatesInserterListView() {
  templatesInserterListView
    .empty()
    .append(
      utils.filterNameByPrefixAndMixValue(
        pref.listKeys(),
        /^template\.(.+)$/,
        key => pref.get(key)
      )
        .map(
          array => {
            const [fullKey, templateKey, templateValue] = array
            return $('<li>')
              .append(
                $('<a>')
                  .on('click', () => {
                    browser.insertSignatureApi.insertTextAtCurrentEditor({ text: templateValue })
                  })
                  .append(
                    $('<h2>').text(templateKey),
                    $('<p>').text(templateValue)
                  )
              )
          }
        )
    )
    .listview('refresh') // need to inject dynamic data
}

$('#page-top').on('pagebeforeshow', () => {
  refreshTemplatesInserterListView()
})

function refreshTemplatesListView() {
  templatesListView
    .empty()
    .append(
      utils.filterNameByPrefixAndMixValue(
        pref.listKeys(),
        /^template\.(.+)$/,
        key => pref.get(key)
      )
        .map(
          array => {
            const [fullKey, templateKey, templateValue] = array
            return $('<li>')
              .append(
                $('<a>')
                  .attr('href', '#page-template-detail')
                  .on('click', () => {
                    titleEdit.val(templateKey)
                    templateEdit.val(templateValue)

                    onSaveTemplateDetail = () => {
                      const newTitle = titleEdit.val()
                      if (templateKey !== newTitle) {
                        pref2.removeTemplate(templateKey)
                      }
                      pref2.setTemplate(newTitle, templateEdit.val())
                      return true
                    }
                    onRemoveThisTemplateDetail = () => {
                      pref2.removeTemplate(templateKey)
                      return true
                    }
                  })
                  .append(
                    $('<h2>').text(templateKey),
                    $('<p>').text(templateValue)
                  )
              )
          }
        )
    )
    .listview('refresh') // need to inject dynamic data
}

$('#page-templates').on('pagebeforeshow', () => {
  refreshTemplatesListView()
})

function allocateNewLabel() {
  for (let x = 1; x <= 1000; x++) {
    const label = browser.i18n.getMessage("newSignatureLabel", x)
    const text = pref2.getTemplate(label)
    if (text === null) {
      return label
    }
  }
}

$('#gotoAddNewTemplateBtn').on('click', () => {
  // clear input text
  titleEdit.val(allocateNewLabel())
  templateEdit.val("")

  onSaveTemplateDetail = () => {
    const newTitle = titleEdit.val()
    if (newTitle.length === 0) {
      titleEdit.focus()
      return false
    }
    pref2.setTemplate(newTitle, templateEdit.val())
    return true
  }
  onRemoveThisTemplateDetail = () => true
})

$('#saveTemplateDetailBtn').on('click', () => {
  return onSaveTemplateDetail()
})

$('#removeThisTemplateBtn').on('click', () => {
  return onRemoveThisTemplateDetail()
})

$('#topLoadingPanel').hide() // if errors are in above scripts, loading won't disappear.

$('[data-trans]').each((index, element) => {
  const elementSelector = $(element)
  if (elementSelector.data("trans") === "text") {
    const message = browser.i18n.getMessage(elementSelector.text().trim())
    if (message) {
      elementSelector.text(message)
    }
  }
})

$("#importFromWindowsLiveMailBtn").on('click', async () => {
  const list = await browser.insertSignatureApi.importSignatureFromWindowsLiveMail()
  for (let { name, text } of list) {
    pref2.setTemplate(name, text)
  }

  refreshTemplatesListView()
})
