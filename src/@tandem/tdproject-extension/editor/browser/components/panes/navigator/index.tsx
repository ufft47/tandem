import "./index.scss";
import * as React from "react";
import { TreeComponent } from "@tandem/editor/browser/components/common";
import {  StoreProvider } from "@tandem/editor/browser/providers";
import { Store, Workspace } from "@tandem/editor/browser/models";
import { Directory, File, BaseFSModel } from "@tandem/editor/common/models";
import { BaseApplicationComponent, TreeNode, inject } from "@tandem/common";

export class NavigatorPaneComponent extends BaseApplicationComponent<{ store?: Store, workspace: Workspace }, any> {
  @inject(StoreProvider.ID)
  private _store: Store;

  render() {
    return <div className="modules-pane">
      <div className="td-section-header">
        Files
      </div>
      <TreeComponent
        nodes={(this.props.store || this._store).cwd.children}
        select={node => {
          this.props.workspace.select(node)
          if (!node.children.length && node instanceof Directory) {
            (node as Directory).load();
          }
        }}
        isNodeHovering={node => false}
        isNodeSelected={node => this.props.workspace.selection.indexOf(node) !== -1}
        renderLabel={node => (node as BaseFSModel).name}
        hasChildren={node => node instanceof Directory}
        isNodeExpanded={node => node.children.length}
        toggleExpand={node => node.children.length ? node.removeAllChildren() : (node as Directory).load()}
         />
    </div>
  }
}