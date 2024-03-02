import { useEuiTheme } from '@elastic/eui';
import { default as v8Dark } from '@elastic/eui/dist/eui_theme_dark.json';
import { default as v8Light } from '@elastic/eui/dist/eui_theme_light.json';
import { Editor, loader } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import * as monaco from 'monaco-editor';
// eslint-disable-next-line import/no-unresolved
import EditorWorker from 'url:monaco-editor/esm/vs/editor/editor.worker.js';
// eslint-disable-next-line import/no-unresolved
import TSWorker from 'url:monaco-editor/esm/vs/language/typescript/ts.worker.js';

loader.config({ monaco });

// See https://github.com/microsoft/monaco-editor/blob/main/docs/integrate-esm.md#using-parcel
self.MonacoEnvironment = {
  getWorkerUrl: (_, label) => (label === 'typescript' || label === 'javascript' ? TSWorker : EditorWorker),
};

export function createTheme(
  euiTheme: typeof v8Dark | typeof v8Light,
  selectionBackgroundColor: string,
  backgroundColor?: string,
): editor.IStandaloneThemeData {
  return {
    base: 'vs',
    inherit: true,
    rules: [
      {
        token: '',
        foreground: euiTheme.euiColorDarkestShade,
        background: euiTheme.euiFormBackgroundColor,
      },
      { token: 'invalid', foreground: euiTheme.euiColorAccent },
      { token: 'emphasis', fontStyle: 'italic' },
      { token: 'strong', fontStyle: 'bold' },

      { token: 'variable', foreground: euiTheme.euiColorPrimary },
      { token: 'variable.predefined', foreground: euiTheme.euiColorSuccess },
      { token: 'constant', foreground: euiTheme.euiColorAccent },
      { token: 'comment', foreground: euiTheme.euiColorMediumShade },
      { token: 'number', foreground: euiTheme.euiColorAccent },
      { token: 'number.hex', foreground: euiTheme.euiColorAccent },
      { token: 'regexp', foreground: euiTheme.euiColorDanger },
      { token: 'annotation', foreground: euiTheme.euiColorMediumShade },
      { token: 'type', foreground: euiTheme.euiColorVis0 },

      { token: 'delimiter', foreground: euiTheme.euiTextSubduedColor },
      { token: 'delimiter.parenthesis', foreground: euiTheme.euiTextSubduedColor },

      { token: 'tag', foreground: euiTheme.euiColorDanger },
      { token: 'metatag', foreground: euiTheme.euiColorSuccess },

      { token: 'key', foreground: euiTheme.euiColorWarning },

      { token: 'attribute.name', foreground: euiTheme.euiColorDanger },
      { token: 'attribute.value', foreground: euiTheme.euiColorPrimary },
      { token: 'attribute.value.number', foreground: euiTheme.euiColorWarning },
      { token: 'attribute.value.unit', foreground: euiTheme.euiColorWarning },

      { token: 'string', foreground: euiTheme.euiColorDanger },

      { token: 'keyword', foreground: euiTheme.euiColorPrimary },
      { token: 'keyword.deprecated', foreground: euiTheme.euiColorAccent },

      { token: 'text', foreground: euiTheme.euiTitleColor },
      { token: 'label', foreground: euiTheme.euiColorVis9 },
    ],
    colors: {
      'editor.foreground': euiTheme.euiColorDarkestShade,
      'editor.background': backgroundColor ?? euiTheme.euiFormBackgroundColor,
      'editorLineNumber.foreground': euiTheme.euiColorDarkShade,
      'editorLineNumber.activeForeground': euiTheme.euiColorDarkShade,
      'editorIndentGuide.background': euiTheme.euiColorLightShade,
      'editor.selectionBackground': selectionBackgroundColor,
      'editorWidget.border': euiTheme.euiColorLightShade,
      'editorWidget.background': euiTheme.euiColorLightestShade,
      'editorCursor.foreground': euiTheme.euiColorDarkestShade,
      'editorSuggestWidget.selectedBackground': euiTheme.euiColorLightShade,
      'list.hoverBackground': euiTheme.euiColorLightShade,
      'list.highlightForeground': euiTheme.euiColorPrimary,
      'editor.lineHighlightBorder': euiTheme.euiColorLightestShade,
    },
  };
}

export interface Props {
  onChange: (scriptContent?: string) => void;
  defaultValue?: string;
}

export function ScriptEditor({ onChange, defaultValue }: Props) {
  const { colorMode } = useEuiTheme();

  const monacoTheme = createTheme(
    colorMode === 'DARK' ? v8Dark : v8Light,
    colorMode === 'DARK' ? '#343551' : '#E3E4ED',
  );

  return (
    <Editor
      height="15vh"
      defaultLanguage="javascript"
      options={{ mouseWheelZoom: true }}
      defaultValue={defaultValue}
      onChange={(value) => onChange(value)}
      theme={'euiTheme'}
      beforeMount={(monaco) => {
        monaco.editor.defineTheme('euiTheme', monacoTheme);
      }}
    />
  );
}
