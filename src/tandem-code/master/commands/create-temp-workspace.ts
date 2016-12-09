import * as path from "path";
import { BaseStudioMasterCommand } from "./base";
import { MimeTypeProvider, inject } from "@tandem/common";
import { TDPROJECT_MIME_TYPE } from "@tandem/tdproject-extension/constants";
import { CreateTemporaryWorkspaceRequest } from "tandem-code/common";
import { FileCacheProvider, FileCache, IFileSystem, FileSystemProvider } from "@tandem/sandbox"; 

let i = 0;

export class CreateTempWorkspaceCommand extends BaseStudioMasterCommand {

  @inject(FileCacheProvider.ID)
  private _fileCache: FileCache;

  @inject(FileSystemProvider.ID)
  private _fs: IFileSystem;
  
  async execute({ filePath }: CreateTemporaryWorkspaceRequest) {

    // temp name must share the same path as the file to ensure that all relative assets
    // are loaded in.
    const tmpName = path.join(path.dirname(filePath), `unsaved${i++}.workspace`);

    let content;

    if (MimeTypeProvider.lookup(filePath, this.injector) === TDPROJECT_MIME_TYPE) {
      content = await this._fs.readFile(filePath);
    } else {
      content = `<tandem>
        <artboard src="${filePath} />
      </tandem>`;
    }

    await this._fileCache.add(tmpName, content);

    
    return 'cache://' + tmpName;
  }
} 