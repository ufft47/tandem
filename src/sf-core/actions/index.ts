import { Action } from "./base";
import { INode } from "sf-core/markup";

export { Action };

export interface Change {
  target: any;
  property: string;
  value: any;
  oldValue: any;
}

export const ADD_CHILD    = "addChild";
export const REMOVE_CHILD = "removeChild";
export class ChildAction extends Action {
  constructor(type: string, readonly child: INode, readonly index: number) {
    super(type);
  }
}

export const CHANGE = "change";
export class ChangeAction extends Action {
  constructor(readonly changes: Array<Change>) {
    super(CHANGE);
  }
}

export const DISPOSE = "dispose";
export class DisposeAction extends Action {
  constructor() {
    super(DISPOSE);
  }
}

export const REMOVE = "remove";
export class RemoveAction extends Action {
  constructor() {
    super(REMOVE);
  }
}

export const PROPERTY_CHANGE = "propertyChange";
export class PropertyChangeAction extends Action {
  constructor(readonly property: string, readonly newValue: any, readonly oldValue: any) {
    super(PROPERTY_CHANGE);
  }
}


export const SETTING_CHANGE = "settingChange";
export class SettingChangeAction extends Action {
  constructor(readonly property: string, readonly newValue: any, readonly oldValue: any) {
    super(SETTING_CHANGE);
  }
}

export const LOAD = "load";
export class LoadAction extends Action {
  constructor() {
    super(LOAD);
  }
}

export const INITIALIZE = "initialize";
export class InitializeAction extends Action {
  constructor() {
    super(INITIALIZE);
  }
}

export const LOG        = "log";
export class LogAction extends Action {
  constructor(readonly level: number, readonly text: string) {
    super(LOG);
  }
}

export class DSAction extends Action {
  readonly timestamp: number = Date.now();
  constructor(actionType: string, readonly collectionName: string) {
    super(actionType);
  }
}

export const DS_INSERT = "dsInsert";
export class DSInsertAction extends DSAction {
  constructor(collectionName: string, readonly data: any) {
    super(DS_INSERT, collectionName);
  }
}

export const DS_UPDATE = "dsUpdate";
export class DSUpdateAction extends DSAction {
  constructor(collectionName: string, readonly data: any, readonly query: any) {
    super(DS_UPDATE, collectionName);
  }
}

export const DS_FIND   = "dsFind";
export class DSFindAction extends DSAction {
  constructor(collectionName: string, readonly query: any, readonly multi: boolean = false) {
    super(DS_FIND, collectionName);
  }
}

export class DSFindAllAction extends DSFindAction {
  constructor(collectionName: string) {
    super(collectionName, {}, true);
  }
}

export const DS_REMOVE   = "dsRemove";
export class DSRemoveAction extends DSAction {
  constructor(collectionName: string, readonly query: any) {
    super(DS_REMOVE, collectionName);
  }
}

export const DS_UPSERT = "dsUpsert";
export class DSUpsertAction extends DSAction {
  constructor(collectionName: string, readonly data: any, readonly query: any) {
    super(DS_UPSERT, collectionName);
  }
}

export const DS_DID_INSERT = "dsDidInsert";
export const DS_DID_REMOVE = "dsDidRemove";
export const DS_DID_UPDATE = "dsDidUpdate";
export class PostDSAction extends DSAction {

  constructor(type: string, collectionName: string, readonly data: any, readonly timestamp: number) {
    super(type, collectionName);
  }

  static createFromDSAction(action: DSInsertAction|DSUpdateAction|DSRemoveAction, data: any) {
    return new PostDSAction({
      [DS_INSERT]: DS_DID_INSERT,
      [DS_UPDATE]: DS_DID_UPDATE,
      [DS_REMOVE]: DS_DID_REMOVE
    }[action.type], action.collectionName, data, action.timestamp);
  }
}

export const ATTRIBUTE_CHANGE = "attributeChange";
export class AttributeChangeAction extends Action {
  constructor(readonly key: string, readonly value: string) {
    super(ATTRIBUTE_CHANGE);
  }
}

export const METADATA_CHANGE = "metadataChange";
export class MetadataChangeAction extends Action {
  constructor(readonly key: string, readonly value: string) {
    super(METADATA_CHANGE);
  }
}

export const UPDATE = "update";
export class UpdateAction extends Action {
  constructor() {
    super(UPDATE);
  }
}

export const OPEN_FILE = "openFile";
export class OpenFileAction extends Action {
  constructor(readonly path: string, readonly watch: boolean = false) {
    super(OPEN_FILE);
  }
}

export const READ_FILE = "readFile";
export class ReadFileAction extends Action {
  constructor(readonly path: string) {
    super(READ_FILE);
  }
}

export const WATCH_FILE = "watchFile";
export class WatchFileAction extends Action {
  constructor(readonly path: string) {
    super(WATCH_FILE);
  }
}

