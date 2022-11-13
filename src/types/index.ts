import type { SourceFile } from 'ts-morph'

export interface IImports {
  [exportName: string]: string
}

export type Dependencies = Map<SourceFile, IImports>

export type IAddDependency = (
  sourceFile: SourceFile,
  exportName: string,
  isDefault: boolean
) => void
