import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { useEffect, useState } from "react";

import ExampleTheme from "./ExampleTheme";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import "./stylesEditor.css";

/*
 Detault toolbar items:
  - blockType
  - bold
  - italic
  - link
*/
export type TextEditorProps = {
  getText: () => string;
  setText: (text: string) => void;
  excludedToolbarItems?: string[];
  variables?: string[];
  height?: string;
};

const editorConfig = {
  theme: ExampleTheme,
  onError(error: any) {
    throw error;
  },
  namespace: "",
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
  ],
};

export const Editor = (props: TextEditorProps) => {
  // Note: <LexicalComposer> accesses `window` also while SSRing.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="editor">
      <LexicalComposer initialConfig={editorConfig}>
        <div className="editor-container">
          <ToolbarPlugin
            getText={props.getText}
            setText={props.setText}
            excludedToolbarItems={props.excludedToolbarItems}
            variables={props.variables}
          />
          <div className="editor-inner" style={{ height: props.height }}>
            <RichTextPlugin
              contentEditable={<ContentEditable style={{ height: props.height }} className="editor-input" />}
              placeholder=""
            />
            <AutoFocusPlugin />
            <ListPlugin />
            <LinkPlugin />
            <AutoLinkPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
};
