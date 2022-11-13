import { SyntaxKind, SourceFile } from 'ts-morph'

export function getNamedImportDeclarations(
  file: SourceFile
): Map<string, string> {
  return new Map(
    file
      .getImportDeclarations()
      .flatMap(declaration => declaration.getNamedImports())
      .map(namedImport => [
        namedImport.getText(),
        // Safe because a NamedImport node will always have an ImportDeclaration as an ancestor.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        namedImport
          .getFirstAncestorByKind(SyntaxKind.ImportDeclaration)!
          .getModuleSpecifierValue(),
      ])
  )
}
