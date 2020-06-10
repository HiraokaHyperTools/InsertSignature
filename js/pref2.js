// pref2 module

// prefs:
// custom_temp_dir
// use_custom_temp_dir
// extension.###

import * as pref from './pref.js'

function normalizeKey(ext) {
  return (ext || '').trim()
}

export default {
  setTemplate(extension, command) {
    pref.set(`template.${normalizeKey(extension)}`, command)
  },
  removeTemplate(extension) {
    pref.remove(`template.${normalizeKey(extension)}`)
  },
  getTemplate(extension) {
    return pref.get(`template.${normalizeKey(extension)}`)
  },
}
