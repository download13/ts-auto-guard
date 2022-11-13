import type { IAddDependency } from '../types'
import type { Guardable } from '../types/guardable'
import type { IProcessOptions } from '../types/project'

import { ExportableNode, Node, Type, SourceFile } from 'ts-morph'

import { GENERATED_WARNING } from '../constants'

export function reportError(message: string, ...args: unknown[]) {
  console.error(`ERROR: ${message}`, ...args)
}

export function lowerFirst(s: string): string {
  const first_code_point = s.codePointAt(0)
  if (first_code_point === undefined) return s
  const first_letter = String.fromCodePoint(first_code_point)
  return first_letter.toLowerCase() + s.substring(first_letter.length)
}

export function findExportableNode(type: Type): (ExportableNode & Node) | null {
  const symbol = type.getSymbol()
  if (symbol === undefined) {
    return null
  }

  return (
    symbol
      .getDeclarations()
      .reduce<Node[]>((acc, node) => [...acc, node, ...node.getAncestors()], [])
      .filter(Node.isExportable)
      .find(n => n.isExported()) || null
  )
}

export function typeToDependency(
  type: Type,
  addDependency: IAddDependency
): void {
  const exportable = findExportableNode(type)
  if (exportable === null) {
    return
  }

  const sourceFile = exportable.getSourceFile()
  const name = exportable.getSymbol()!.getName()
  const isDefault = exportable.isDefaultExport()

  if (!exportable.isExported()) {
    reportError(`${name} is not exported from ${sourceFile.getFilePath()}`)
  }

  addDependency(sourceFile, name, isDefault)
}

export function outFilePath(sourcePath: string, guardFileName: string) {
  const outPath = sourcePath.replace(
    /\.(ts|tsx|d\.ts)$/,
    `.${guardFileName}.ts`
  )
  if (outPath === sourcePath)
    throw new Error(
      'Internal Error: sourcePath and outFilePath are identical: ' + outPath
    )
  return outPath
}

export function deleteGuardFile(sourceFile: SourceFile) {
  if (sourceFile.getFullText().indexOf(GENERATED_WARNING) >= 0) {
    sourceFile.delete()
  } else {
    console.warn(
      `${sourceFile.getFilePath()} is named like a guard file, but does not contain the generated header. Consider removing or renaming the file, or change the guardFileName setting.`
    )
  }
}

// https://github.com/dsherret/ts-simple-ast/issues/108#issuecomment-342665874
export function isClassType(type: Type): boolean {
  if (type.getConstructSignatures().length > 0) {
    return true
  }

  const symbol = type.getSymbol()
  if (symbol == null) {
    return false
  }

  for (const declaration of symbol.getDeclarations()) {
    if (Node.isClassDeclaration(declaration)) {
      return true
    }
    if (
      Node.isVariableDeclaration(declaration) &&
      declaration.getType().getConstructSignatures().length > 0
    ) {
      return true
    }
  }

  return false
}

export function isReadonlyArrayType(type: Type): boolean {
  const symbol = type.getSymbol()
  if (symbol === undefined) {
    return false
  }
  return (
    symbol.getName() === 'ReadonlyArray' && type.getTypeArguments().length === 1
  )
}

export function getReadonlyArrayType(type: Type): Type | undefined {
  return type.getTypeArguments()[0]
}

export function getTypeGuardName(
  child: Guardable,
  options: IProcessOptions
): string | null {
  const jsDocs = child.getJsDocs()
  for (const doc of jsDocs) {
    for (const line of doc.getInnerText().split('\n')) {
      const match = line
        .trim()
        .match(/@see\s+(?:{\s*(@link\s*)?(\w+)\s*}\s+)?ts-auto-guard:([^\s]*)/)
      if (match !== null) {
        const [, , typeGuardName, command] = match
        if (command !== 'type-guard') {
          reportError(`command ${command} is not supported!`)
          return null
        }
        return typeGuardName
      }
    }
  }
  if (options.exportAll) {
    const t = child.getType()
    const symbols = [child, t.getSymbol(), t.getAliasSymbol()]
    // type aliases have type __type sometimes
    const name = symbols
      .filter(x => x && x.getName() !== '__type')[0]
      ?.getName()
    if (name) {
      return 'is' + name
    }
  }
  return null
}
