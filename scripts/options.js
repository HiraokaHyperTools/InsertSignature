// called by options.html

// `$` is: very old `jQuery` 1.12.4

// prefs:
// custom_temp_dir
// use_custom_temp_dir
// extension.###

const { pref, utils } = pimple

let onSaveExtensionDetail
let onRemoveThisExtensionDetail

const extensionEdit = $('#extensionEdit')
const commandEdit = $('#commandEdit')
const workDirEdit = $('#workDirEdit')
const extensionsListView = $('#extensionsListView')

$('#page-workdir').on('pagebeforeshow', () => {
  workDirEdit.val(pref.get('custom_temp_dir'))
})

$('#saveWorkDirBtn').on('click', () => {
  pref.set('custom_temp_dir', workDirEdit.val())
  $.mobile.navigate('#page-top')
})

$('#page-extensions').on('pagebeforeshow', () => {
  extensionsListView
    .empty()
    .append(
      utils.filterNameByPrefixAndMixValue(
        pref.listKeys(),
        /^extension\.(.+)$/,
        key => pref.get(key)
      )
        .map(
          array => {
            const [key, extension, command] = array
            return $('<li>')
              .append(
                $('<a>')
                  .attr('href', '#page-extension-detail')
                  .on('click', () => {

                    extensionEdit.val(extension)
                    commandEdit.val(command)

                    onSaveExtensionDetail = () => {
                      pref.set(key, commandEdit.val())
                      return true
                    }
                    onRemoveThisExtensionDetail = () => {
                      pref.remove(key)
                      return true
                    }
                  })
                  .append(
                    $('<h2>').text(extension),
                    $('<p>').text(command)
                  )
              )
          }
        )
    )
    .listview('refresh') // need to inject dynamic data
})

$('#gotoAddNewExtensionBtn').on('click', () => {
  // clear input text
  commandEdit.val("")
  extensionEdit.val("")

  onSaveExtensionDetail = () => {
    const newExtension = extensionEdit.val()
    if (newExtension.length === 0) {
      extensionEdit.focus()
      return false
    }
    pref.set(`extension.${newExtension}`, commandEdit.val())
    return true
  }
  onRemoveThisExtensionDetail = () => true
})

$('#saveExtensionDetailBtn').on('click', () => {
  return onSaveExtensionDetail()
})

$('#removeThisExtensionBtn').on('click', () => {
  return onRemoveThisExtensionDetail()
})