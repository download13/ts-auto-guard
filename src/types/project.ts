export interface IProcessOptions {
  exportAll?: boolean
  importGuards?: string
  preventExportImported?: boolean
  shortCircuitCondition?: string
  debug?: boolean
  guardFileName?: string
}

export interface IGenerateOptions {
  paths?: ReadonlyArray<string>
  project: string
  processOptions: Readonly<IProcessOptions>
}
