import {type InterfaceDeclaration ,type TypeAliasDeclaration, type EnumDeclaration, Node  } from 'ts-morph'

export type Guardable = InterfaceDeclaration | TypeAliasDeclaration | EnumDeclaration

export function isGuardable(value: Node): value is Guardable {
  return (
    Node.isTypeAliasDeclaration(value) ||
    Node.isInterfaceDeclaration(value) ||
    Node.isEnumDeclaration(value)
  )
}
