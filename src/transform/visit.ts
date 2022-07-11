import type { Node, TransformationContext, Visitor } from 'typescript'
import { visitEachChild } from 'typescript'

import type { NodeVisitor } from '../objects'

function visit<N extends Node>(nodeVisitor: NodeVisitor<N>, nodes: Node[]): Node[] {
  const nextNodes: Node[] = []
  nodes.forEach(node => {
    if (nodeVisitor.wants(node)) {
      nextNodes.push(...nodeVisitor.visit(node))
    } else {
      nextNodes.push(node)
    }
  })
  return nextNodes
}

export default function (context: TransformationContext, nodeVisitors: NodeVisitor<any>[]): Visitor {
  const visitor: Visitor = node => {
    const newNodes = nodeVisitors.reduce(
      (nodes, nodeVisitor) => {
        return visit(nodeVisitor, nodes)
      },
      [node]
    )

    if (newNodes.length === 0) {
      return undefined
    } else if (newNodes.length === 1) {
      return visitEachChild(newNodes[0], visitor, context, undefined, visitor)
    } else {
      const resultNodes: Node[] = []
      for (const newNode of newNodes) {
        const visitOneResult = visitEachChild(newNode, visitor, context, undefined, visitor)
        if (typeof visitOneResult === 'undefined') {
          return undefined
        } else {
          resultNodes.push(visitOneResult)
        }
      }
      return resultNodes
    }
  }

  return visitor
}
