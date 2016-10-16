import "reflect-metadata";
import * as Url from "url";
import { LocalFileSystem } from "@tandem/sandbox";

window["config"] = {
  fileSystem: new LocalFileSystem(),
  backend: {
    hostname: "127.0.0.1",
    port: Number(Url.parse(window.location.toString(), true).query.backendPort)
  }
};

require("@tandem/editor/bundle/editor");
