import { SlimParentNode, SlimVMObjectType, SlimElement, SlimTextNode, SlimBaseNode, SlimStyleElement, SlimCSSStyleSheet, SlimCSSStyleRule, SlimCSSMediaRule, SlimCSSRule, Bounds } from "./state";
import { weakMemo } from "./utils";
import { Mutation, SetValueMutation, SetPropertyMutation, RemoveChildMutation, InsertChildMutation } from "source-mutation"
import { SET_TEXT_NODE_VALUE, SET_ATTRIBUTE_VALUE, REMOVE_CHILD_NODE, INSERT_CHILD_NODE } from "./diff-patch";
import { uncompressRootNode } from "./compression";

export const renderDOM = (node: SlimBaseNode, mount: HTMLElement) => {
  let map: DOMNodeMap = {};
  mount.appendChild(createNode(node, mount.ownerDocument, map));
  return map;
};

export type DOMNodeMap = {
  [identifier: string]: HTMLElement|Text
};

const createNode = (node: SlimBaseNode, document: Document, map: DOMNodeMap) => {
  switch(node.type) {
    case SlimVMObjectType.TEXT: {
      return map[node.id] = document.createTextNode((node as SlimTextNode).value);
    }
    case SlimVMObjectType.ELEMENT: {
      const { tagName, id, shadow, childNodes, attributes } = node as SlimElement;
      const ret = map[id] = document.createElement(tagName);
      if (shadow) {
        ret.attachShadow({ mode: "open" }).appendChild(createNode(shadow, document, map));
      }

      if (tagName === "style") {
        renderStyle((node as SlimStyleElement).sheet, ret as HTMLStyleElement);
      }
      for (let i = 0, {length} = attributes; i < length; i++) {
        const attribute = attributes[i];
        if (attribute.name === "style") {
          if (typeof attribute.value === "object") {
            Object.assign(ret[attribute.name], attribute.value);
          }
        } else if (attribute.value) {
          ret.setAttribute(attribute.name, attribute.value);
        }
      }
      for (let i = 0, {length} = childNodes; i < length; i++) {
        ret.appendChild(createNode(childNodes[i], document, map));
      }
      return ret;
    }
    case SlimVMObjectType.DOCUMENT_FRAGMENT: {
      const { childNodes } = node as SlimParentNode;
      const fragment = document.createDocumentFragment();
      for (let i = 0, {length} = childNodes; i < length; i++) {
        fragment.appendChild(createNode(childNodes[i], document, map));
      }
      return fragment;
    }
    default: {
      console.warn(`Unable to render node`);
      return document.createTextNode(``);
    }
  }
};

const renderStyle = (sheet: SlimCSSStyleSheet, element: HTMLStyleElement) => {
  let j = 0;
  let buffer = ``;
  for (let i = 0, {length} = sheet.rules; i < length; i++) {
    const rule = sheet.rules[i];
    const ruleText = stringifyRule(sheet.rules[i]);
    if (!ruleText) {
      continue;
    }

    buffer += `${ruleText}\n`;
  }

  element.textContent = buffer;
}

// TODO - move to util file
const stringifyRule = (rule: SlimCSSRule) => {
  switch(rule.type) {
    case SlimVMObjectType.STYLE_RULE: {
      const { selectorText, style } = rule as SlimCSSStyleRule;
      let buffer = `${selectorText} {`;
      for (const key in style) {
        buffer += `${key}: ${style[key]};`
      }

      return `${buffer} }`;
    }
    case SlimVMObjectType.MEDIA_RULE: {
      const { conditionText, rules } = rule as SlimCSSMediaRule;
      return `@media ${conditionText} { ${rules.map(stringifyRule)} }`
    }
  }
};

export type ComputedDOMElementInfo = {
  bounds: Bounds;
  style: CSSStyleDeclaration;
};

export type ComputedDOMInfo = {
  [identifier: string]: ComputedDOMElementInfo
};

// do NOT memoize this since computed information may change over time. 
export const computedDOMInfo = (map: DOMNodeMap): ComputedDOMInfo => {
  let computedInfo = {};
  for (const nodeId in map) {
    const node = map[nodeId];

    if (node.nodeName.charAt(0) === "#") {
      continue;
    }
    
    const element = node as HTMLElement;

    // TODO - memoize computed info here
    computedInfo[nodeId] = {
      bounds: element.getBoundingClientRect(),
      style: element.ownerDocument.defaultView.getComputedStyle(element)
    };
  }
  return computedInfo;
};

// TODO
export const patchDOM = (diffs: Mutation<string>[], map: DOMNodeMap, container: HTMLIFrameElement): DOMNodeMap => {
  for (let i = 0, {length} = diffs; i < length; i++) {
    const mutation = diffs[i];
    const target = map[mutation.target];
    switch(mutation.type) {
      case SET_TEXT_NODE_VALUE: {
        (target as Text).nodeValue = (mutation as SetValueMutation<string>).newValue;
        break;
      }
      case SET_ATTRIBUTE_VALUE: {
        const { name, newValue } = mutation as SetPropertyMutation<string>;
        (target as HTMLElement).setAttribute(name, newValue);
        break;
      }
      case REMOVE_CHILD_NODE: {
        const { child, index } = mutation as RemoveChildMutation<string, string>;
        map = { ...map, [child]: undefined };
        target.removeChild(target.childNodes[index]);
        break;
      }
      case INSERT_CHILD_NODE: {
        const { child, index } = mutation as InsertChildMutation<string, any>;
        let childMap: DOMNodeMap = {};
        const nativeChild = createNode(uncompressRootNode(child), document, childMap);
        if (index >= target.childNodes.length) {
          target.appendChild(nativeChild);
        } else {
          target.insertBefore(nativeChild, target.childNodes[index]);
        }
        map = { ...map, ...childMap };
        break;
      }
    }
  }

  return map;
};