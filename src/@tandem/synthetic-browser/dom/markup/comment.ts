import { MarkupNodeType } from "./node-types";
import { IMarkupNodeVisitor } from "./visitor";
import { SyntheticDocument } from "../document";
import { SyntheticDOMValueNode } from "./value-node";

export class SyntheticDOMComment extends SyntheticDOMValueNode {
  readonly nodeType: number = MarkupNodeType.COMMENT;

  constructor(nodeValue: string, ownerDocument: SyntheticDocument) {
    super("#comment", nodeValue, ownerDocument);
  }

  toString() {
    return "";
  }

  get textContent() {
    return "";
  }

  accept(visitor: IMarkupNodeVisitor) {
    return visitor.visitComment(this);
  }

  cloneNode() {
    return new SyntheticDOMComment(this.nodeValue, this.ownerDocument);
  }
}