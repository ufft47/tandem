// note unused imports - fixes --declaration issue with typescript

import { MimeTypeProvider, HTML_MIME_TYPE } from "@tandem/common";
import { createHTMLCoreProviders, createHTMLSandboxProviders } from "../../index";
import {
  DependencyLoaderFactoryProvider,
  ContentEditorFactoryProvider,
  SandboxModuleEvaluatorFactoryProvider,
} from "@tandem/sandbox";

import { SyntheticDOMElementClassProvider } from "@tandem/synthetic-browser";
import { SelfPreviewLoader, PreviewLoaderProvider } from "@tandem/editor/worker/providers";

export const createHTMLEditorWorkerProviders = () => {
  return [
    ...createHTMLCoreProviders(),
    ...createHTMLSandboxProviders(),
    new PreviewLoaderProvider("htmlPreview", (uri, injector) => {
      return MimeTypeProvider.lookup(uri, injector) === HTML_MIME_TYPE;
    }, SelfPreviewLoader)
  ];
}

export * from "../../core";