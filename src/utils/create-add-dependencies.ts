import type { Dependencies, IAddDependency } from '../types'

import { reportError } from './helpers'

export function createAddDependency(
  dependencies: Dependencies
): IAddDependency {
  return function addDependency(sourceFile, name, isDefault) {
    const alias = name
    if (isDefault) {
      name = 'default'
    }
    let imports = dependencies.get(sourceFile)
    if (imports === undefined) {
      imports = {}
      dependencies.set(sourceFile, imports)
    }

    const previousAlias = imports[name]
    if (previousAlias !== undefined && previousAlias !== alias) {
      reportError(
        `Conflicting export alias for "${sourceFile.getFilePath()}": "${alias}" vs "${previousAlias}"`
      )
    }

    imports[name] = alias
  }
}
