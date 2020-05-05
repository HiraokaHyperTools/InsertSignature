// OpenAttachmentByExtension pimple module

(function () {
  const self = this

  // See Pimple.js reference: https://github.com/Mparaiso/Pimple.js
  const { pimple } = this // by declare-pimple.js

  pimple.set('pref', pimple.share((pimple) => {
    return {
      'get': (key) => {
        return localStorage.getItem(`pref.${key}`)
      },
      'set': (key, value) => {
        localStorage.setItem(`pref.${key}`, value)
      },
      'remove': (key) => {
        localStorage.removeItem(`pref.${key}`)
      },
      'listKeys': () => {
        const list = []
        for (let i = 0; i < localStorage.length; i++) {
          const rawKey = localStorage.key(i)
          if (rawKey.startsWith('pref.')) {
            list.push(rawKey.substr(5))
          }
        }
        return list
      },
    }
  }))

}).apply(this)
