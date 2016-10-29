
import { inject } from "@tandem/common/decorators";
import { IActor } from "@tandem/common/actors";
import { InsertTool } from "@tandem/editor/browser/models/insert-tool";
import { MouseAction } from "@tandem/editor/browser/actions";
import { IApplication } from "@tandem/common/application";
import { SetToolAction } from "@tandem/editor/browser/actions";
import { TEXT_TOOL_KEY_CODE } from "@tandem/html-extension/constants";
import { FrontEndApplication } from "@tandem/editor/browser/application";
import { pointerToolDependency } from "@tandem/editor/browser/models/pointer-tool";
import { BaseApplicationService } from "@tandem/common/services";
import { WorkspaceToolFactoryDependency } from "@tandem/editor/browser/dependencies";
import { IWorkspaceTool, BaseEditorTool } from "@tandem/editor/browser/models";

import {
  Dependency,
  Dependencies,
  PrivateBusDependency,
  DependenciesDependency,
  ApplicationServiceDependency,
} from "@tandem/common/dependencies";

import {
  parseMarkup,
  evaluateMarkup,
  SyntheticDOMElement
} from "@tandem/synthetic-browser";

/*
const editor = new HTMLEditor();
editor.open(new HTMLFile());
*/

export class EditInnerHTMLTool extends BaseEditorTool {

  @inject(PrivateBusDependency.ID)
  readonly bus: IActor;

  @inject(DependenciesDependency.ID)
  readonly dependencies: Dependencies;

  private _disposed: boolean;

  name = "text";
  cursor = null;

  constructor(editor: any) {
    super(editor);
    this._startEditing();
  }

  private _startEditing() {
    const element = this._targetNode;
    element.setAttribute("contenteditable", "true");
    element.addEventListener("keydown", this._onKeyDown);

    // some async stuff is preventing the element
    // from being selected, so add a timeout for now.
    setTimeout(() => {
      element.focus();
      element.ownerDocument.execCommand("selectAll", false, null);
    }, 100);
  }

  private _onKeyDown = (event: KeyboardEvent) => {

    if (event.which === 27) {
      this.dispose();
    }

    // janky as hell, but this is a fairly simple approach to prevent
    //  auto body scrolling for inputs. We don't want that since it
    // conflicts with out paning tool.
    requestAnimationFrame(() => {
      this._targetNode.ownerDocument.body.scrollLeft = 0;
      this._targetNode.ownerDocument.body.scrollTop  = 0;
    });
  }

  private get _targetEntity() {
    return this.editor.selection[0];
  }

  private get _targetNode() {
    return <HTMLSpanElement>this._targetEntity.section.targetNode;
  }

  public async dispose() {
    if (this._disposed) return;
    this._disposed = true;
    this._targetNode.setAttribute("contenteditable", "false");
    this._targetNode.removeEventListener("keydown", this._onKeyDown);

    // parse the innerHTML, set the source content, and prepare to diff
    this._targetEntity.source.removeAllChildNodes();
    // parseMarkup(this._targetNode.innerHTML).children.forEach((child) => this._targetEntity.source.appendChild(child));

    // reset the html so that the entity is properly diffd
    (<Element>this._targetEntity.section.targetNode).innerHTML = " ";

    // save the workspae file -- diffing time
    // this.bus.execute(new SetToolAction(<WorkspaceToolFactoryDependency>this.dependencies.query(pointerToolDependency.id)));
  }

  public canvasMouseDown(event: MouseAction) {
    if (event.originalEvent.target === this._targetNode) return;
    this.dispose();
  }
}

class InsertTextTool extends InsertTool {
  readonly cursor: string = "text";
  readonly resizable: boolean = false;

  @inject(DependenciesDependency.ID)
  private _dependencies: Dependencies;

  get displayEntityToolFactory() {
    return <WorkspaceToolFactoryDependency>this._dependencies.query(editInnerHTMLDependency.id);
  }

  createSyntheticDOMElement() {
    return evaluateMarkup(parseMarkup(`<span style="position:absolute;white-space: nowrap;font-family: Helvetica;">Type Something</span>`).childNodes[0], this.editor.document) as SyntheticDOMElement;
  }
}

export const textToolDependency = new WorkspaceToolFactoryDependency("text", "text", "display", "t", InsertTextTool);
export const editInnerHTMLDependency = new WorkspaceToolFactoryDependency("editInnerHTML", null, null, TEXT_TOOL_KEY_CODE, EditInnerHTMLTool);