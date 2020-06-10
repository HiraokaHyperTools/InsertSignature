// utils module

import pref2 from './pref2.js'

export function filterNameByPrefixAndMixValue(nameList, regex, valueGetter) {
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
    .sort(
      (a, b) => {
        if (a[0] < b[0]) {
          return -1
        }
        if (a[0] > b[0]) {
          return 1
        }
        return 0
      }
    )
}

function getFileExtension(fileName) {
  const index = fileName.lastIndexOf('.')
  return (index >= 1) ? fileName.substr(index + 1) : ""
}

export function buildLauncherSetFromFromFileName(fileName) {
  const extension = getFileExtension(fileName)

  let parameters = []

  let command = pref2.getExtensionCommand(extension || '@@@')
  if (!command) {
    if (!isNaN(extension)) {
      command = pref2.getExtensionCommand('###')
    }
    if (!command) {
      command = pref2.getExtensionCommand('***')
    }
  }

  //console.info(fileName, extension, command)

  const parts = (command || '').split('%%')

  return {
    program: parts[0],
    parameters: parameters.concat(parts.slice(1)),
  }
}
