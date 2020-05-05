// OpenAttachmentByExtension pimple module

(function () {
  const self = this

  // See Pimple.js reference: https://github.com/Mparaiso/Pimple.js
  const { pimple } = this // by declare-pimple.js

  pimple.set('utils', pimple.share((pimple) => {
    return {
      'filterNameByPrefixAndMixValue': (nameList, regex, valueGetter) => {
        return nameList
          .map(
            name => {
              const result = regex.exec(name)
              if (result) {
                return [
                  name,
                  result[1],
                  valueGetter(name)
                ]
              } else {
                return undefined
              }
            }
          )
          .filter(list => list !== undefined)
      },
    }
  }))

}).apply(this)
