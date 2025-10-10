import type { SupportedLanguage } from '../CodeBlock.types';

export interface CodeFile {
  id: string;
  name: string;
  code: string;
  language?: SupportedLanguage;
}

export interface CodeEditorProps {
  // Files to edit
  files?: CodeFile[];

  // Single file mode (simpler API)
  code?: string;
  language?: SupportedLanguage;
  fileName?: string;

  // Display options
  mode?: 'mini' | 'full';
  layout?: 'tabs' | 'split'; // tabs for mobile, split for desktop
  height?: number;
  width?: number;

  // Features
  editable?: boolean;
  showFileTree?: boolean;
  showPreview?: boolean;
  showLineNumbers?: boolean;
  showHeader?: boolean;

  // Preview rendering
  renderPreview?: (code: string, language?: SupportedLanguage, onExpandPress?: () => void) => React.ReactNode;
  previewErrorFallback?: (error: Error) => React.ReactNode;

  // Callbacks
  onChange?: (code: string, fileId?: string) => void;
  onFileSelect?: (file: CodeFile) => void;
  onExpandPress?: () => void;
  onPreviewExpandPress?: () => void;

  // Styling
  title?: string;
  description?: string;
  style?: any;
}

export interface CodeEditorState {
  activeFileId: string | null;
  activeTab: 'code' | 'preview';
  code: string;
  error: Error | null;
}

export type CodeEditorLayout = 'tabs' | 'split';
export type CodeEditorTab = 'code' | 'preview';
