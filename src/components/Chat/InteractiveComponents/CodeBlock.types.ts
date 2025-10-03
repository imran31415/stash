export type CodeBlockMode = 'mini' | 'preview' | 'full';

export type SupportedLanguage = 
  | 'typescript' | 'javascript' | 'tsx' | 'jsx'
  | 'python' | 'java' | 'csharp' | 'go' | 'rust'
  | 'ruby' | 'php' | 'swift' | 'kotlin'
  | 'html' | 'css' | 'scss' | 'json' | 'yaml' | 'xml'
  | 'sql' | 'bash' | 'shell' | 'markdown'
  | 'plaintext' | 'text';

export interface CodeBlockProps {
  code: string;
  language?: SupportedLanguage;
  fileName?: string;
  mode?: CodeBlockMode;
  title?: string;
  showLineNumbers?: boolean;
  startLineNumber?: number;
  highlightLines?: number[];
  maxLines?: number; // For mini/preview modes
  onViewFullFile?: () => void;
  onCopy?: () => void;
  style?: any;
}

export interface CodeBlockDetailViewProps {
  visible: boolean;
  code: string;
  language?: SupportedLanguage;
  fileName?: string;
  title?: string;
  showLineNumbers?: boolean;
  onClose: () => void;
  onCopy?: () => void;
}

export interface CodeBlockPaginationState {
  currentPage: number;
  totalPages: number;
  linesPerPage: number;
  startLine: number;
  endLine: number;
}

export interface SyntaxToken {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'function' | 'operator' | 'variable' | 'type' | 'plain';
  value: string;
}
