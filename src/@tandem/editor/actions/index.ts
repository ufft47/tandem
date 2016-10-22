import { Action } from "@tandem/common/actions";
import { IActor } from "@tandem/common/actors";
import { File } from "@tandem/common";
import { toArray } from "@tandem/common/utils/array";
import { IRange, IPoint } from "@tandem/common/geom";
import { uniq } from "lodash";
import { Workspace, IWorkspaceTool, IHistoryItem } from "@tandem/editor/models";
import { WorkspaceToolFactoryDependency } from "@tandem/editor/dependencies";

export class MouseAction extends Action {

  static readonly CANVAS_MOUSE_DOWN = "canvasMouseDown";
  static readonly SELECTION_DOUBLE_CLICK = "selectionDoubleClick";

  constructor(type, readonly originalEvent: MouseEvent) {
    super(type);
    Object.assign(this, {
      clientX : originalEvent.clientX,
      clientY : originalEvent.clientY,
      metaKey : originalEvent.metaKey
    });
  }
  preventDefault() {
    this.originalEvent.preventDefault();
  }
}

export class KeyboardAction extends Action {

  static readonly CANVAS_KEY_DOWN = "canvasKeyDown";

  readonly keyCode: number;
  readonly which: number;
  constructor(type, readonly originalEvent: KeyboardEvent) {
    super(type);
    Object.assign(this, {
      which : originalEvent.which,
      keyCode: originalEvent.keyCode
    });
  }

  preventDefault() {
    this.originalEvent.preventDefault();
  }
}

export class SelectAction extends Action {

  static readonly SELECT = "SELECT";

  public items: Array<any>;
  public keepPreviousSelection: boolean;
  public toggle: boolean;

  constructor(items: any = undefined, keepPreviousSelection = false, toggle = false) {
    super(SelectAction.SELECT);
    this.items = toArray(items);
    this.keepPreviousSelection = !!keepPreviousSelection;
    this.toggle = toggle;
  }
}


export class SelectAllAction extends Action {
  static readonly SELECT_ALL = "selectAll";
  constructor() {
    super(SelectAllAction.SELECT_ALL);
  }
}

export class SelectEntitiesAtSourceOffsetAction extends Action {
  static readonly SELECT_ENTITIES_AT_SOURCE_OFFSET = "selectEntitiesAtSourceOffset";
  readonly data: Array<IRange>;
  constructor(readonly filePath: string, ...data: Array<IRange>) {
    super(SelectEntitiesAtSourceOffsetAction.SELECT_ENTITIES_AT_SOURCE_OFFSET);
    this.data = data;
  }
}

export class ToggleSelectAction extends SelectAction {
  constructor(items = undefined, keepPreviousSelection: boolean = false) {
    super(items, keepPreviousSelection, true);
  }
}

export class ZoomAction extends Action {
  static readonly ZOOM = "zoom";
  constructor(readonly delta: number, readonly ease: boolean = false) {
    super(ZoomAction.ZOOM);
  }
}

export class SetZoomAction extends Action {
  static readonly SET_ZOOM = "setZoom";
  constructor(readonly value: number, readonly ease: boolean = false) {
    super(SetZoomAction.SET_ZOOM);
  }
}

export class PasteAction extends Action {
  static readonly PASTE = "paste";
  constructor(readonly item: DataTransferItem) {
    super(PasteAction.PASTE);
  }
}

export class DeleteSelectionAction extends Action {
  static readonly DELETE_SELECTION = "deleteSelection";
  constructor() {
    super(DeleteSelectionAction.DELETE_SELECTION);
  }
}

export class SetToolAction extends Action {
  static readonly SET_TOOL = "setTool";
  constructor(readonly toolFactory: { create(workspace: Workspace): IWorkspaceTool }) {
    super(SetToolAction.SET_TOOL);
  }
}

export class KeyCommandAction extends Action {
  static readonly KEY_COMMAND = "keyCommand";
  constructor(readonly combo: string) {
    super(KeyCommandAction.KEY_COMMAND);
  }
}

export class RemoveSelectionAction extends Action {
  static readonly REMOVE_SELECTION = "removeSelection";
  constructor() {
    super(RemoveSelectionAction.REMOVE_SELECTION);
  }
}


export class DocumentFileAction extends Action {
  static readonly LOADED = "loaded";
  constructor(readonly type: string) {
    super(type);
  }
}