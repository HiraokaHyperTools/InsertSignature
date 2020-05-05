// utils module

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
}
