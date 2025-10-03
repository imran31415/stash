import { SupportedLanguage, SyntaxToken, CodeBlockPaginationState } from './CodeBlock.types';

// Language display names and icons
export const LANGUAGE_INFO: Record<string, { name: string; icon: string; color: string }> = {
  typescript: { name: 'TypeScript', icon: 'TS', color: '#3178C6' },
  javascript: { name: 'JavaScript', icon: 'JS', color: '#F7DF1E' },
  tsx: { name: 'TSX', icon: 'TSX', color: '#3178C6' },
  jsx: { name: 'JSX', icon: 'JSX', color: '#61DAFB' },
  python: { name: 'Python', icon: 'PY', color: '#3776AB' },
  java: { name: 'Java', icon: 'JAVA', color: '#007396' },
  csharp: { name: 'C#', icon: 'C#', color: '#239120' },
  go: { name: 'Go', icon: 'GO', color: '#00ADD8' },
  rust: { name: 'Rust', icon: 'RS', color: '#CE422B' },
  ruby: { name: 'Ruby', icon: 'RB', color: '#CC342D' },
  php: { name: 'PHP', icon: 'PHP', color: '#777BB4' },
  swift: { name: 'Swift', icon: 'SWIFT', color: '#FA7343' },
  kotlin: { name: 'Kotlin', icon: 'KT', color: '#7F52FF' },
  html: { name: 'HTML', icon: 'HTML', color: '#E34F26' },
  css: { name: 'CSS', icon: 'CSS', color: '#1572B6' },
  scss: { name: 'SCSS', icon: 'SCSS', color: '#CC6699' },
  json: { name: 'JSON', icon: 'JSON', color: '#000000' },
  yaml: { name: 'YAML', icon: 'YAML', color: '#CB171E' },
  xml: { name: 'XML', icon: 'XML', color: '#0060AC' },
  sql: { name: 'SQL', icon: 'SQL', color: '#CC2927' },
  bash: { name: 'Bash', icon: 'SH', color: '#4EAA25' },
  shell: { name: 'Shell', icon: 'SH', color: '#4EAA25' },
  markdown: { name: 'Markdown', icon: 'MD', color: '#083FA1' },
  plaintext: { name: 'Plain Text', icon: 'TXT', color: '#6B7280' },
  text: { name: 'Text', icon: 'TXT', color: '#6B7280' },
};

// Syntax colors matching common themes
const SYNTAX_COLORS = {
  keyword: '#C678DD',      // Purple
  string: '#98C379',       // Green
  comment: '#5C6370',      // Gray
  number: '#D19A66',       // Orange
  function: '#61AFEF',     // Blue
  operator: '#56B6C2',     // Cyan
  variable: '#E06C75',     // Red
  type: '#E5C07B',         // Yellow
  plain: '#ABB2BF',        // Light gray
};

// Simple tokenizer for basic syntax highlighting
export function tokenizeCode(code: string, language: SupportedLanguage): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  
  // Keywords by language family
  const keywords: Record<string, string[]> = {
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'new', 'this', 'true', 'false', 'null', 'undefined', 'typeof', 'instanceof'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'new', 'this', 'true', 'false', 'null', 'undefined', 'typeof', 'instanceof', 'interface', 'type', 'enum', 'public', 'private', 'protected'],
    python: ['def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'lambda', 'yield', 'async', 'await'],
    java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'import', 'return', 'if', 'else', 'for', 'while', 'new', 'this', 'super', 'static', 'final', 'void', 'int', 'String', 'boolean', 'true', 'false', 'null'],
    go: ['package', 'import', 'func', 'return', 'if', 'else', 'for', 'range', 'type', 'struct', 'interface', 'var', 'const', 'go', 'defer', 'chan', 'select', 'case', 'default', 'true', 'false', 'nil'],
    rust: ['fn', 'let', 'mut', 'const', 'struct', 'enum', 'impl', 'trait', 'use', 'mod', 'pub', 'return', 'if', 'else', 'match', 'for', 'while', 'loop', 'break', 'continue', 'true', 'false', 'Self', 'self'],
  };

  // Get keywords for the language
  let langKeywords: string[] = [];
  if (language in keywords) {
    langKeywords = keywords[language];
  } else if (['tsx', 'jsx'].includes(language)) {
    langKeywords = keywords.typescript;
  } else if (['csharp'].includes(language)) {
    langKeywords = keywords.java; // Similar syntax
  }

  // Simple regex-based tokenization
  const lines = code.split('\n');
  
  lines.forEach((line, lineIndex) => {
    // Check for comments
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
      tokens.push({ type: 'comment', value: line });
      if (lineIndex < lines.length - 1) {
        tokens.push({ type: 'plain', value: '\n' });
      }
      return;
    }

    // Check for multi-line comments (simple detection)
    if (line.trim().startsWith('/*') || line.trim().startsWith('*/') || line.trim().startsWith('*')) {
      tokens.push({ type: 'comment', value: line });
      if (lineIndex < lines.length - 1) {
        tokens.push({ type: 'plain', value: '\n' });
      }
      return;
    }

    // Split line into tokens
    const parts = line.split(/(\s+|[{}()\[\];,.])/);
    
    parts.forEach(part => {
      if (!part) return;
      
      // Whitespace
      if (/^\s+$/.test(part)) {
        tokens.push({ type: 'plain', value: part });
        return;
      }

      // String literals
      if (/^["'`]/.test(part)) {
        tokens.push({ type: 'string', value: part });
        return;
      }

      // Numbers
      if (/^\d+(\.\d+)?$/.test(part)) {
        tokens.push({ type: 'number', value: part });
        return;
      }

      // Keywords
      if (langKeywords.includes(part)) {
        tokens.push({ type: 'keyword', value: part });
        return;
      }

      // Function calls (word followed by ()
      if (/^[a-zA-Z_]\w*$/.test(part)) {
        tokens.push({ type: 'function', value: part });
        return;
      }

      // Operators
      if (/^[+\-*/<>=!&|]+$/.test(part)) {
        tokens.push({ type: 'operator', value: part });
        return;
      }

      // Default to plain
      tokens.push({ type: 'plain', value: part });
    });

    // Add newline except for last line
    if (lineIndex < lines.length - 1) {
      tokens.push({ type: 'plain', value: '\n' });
    }
  });

  return tokens;
}

export function getTokenColor(tokenType: SyntaxToken['type']): string {
  return SYNTAX_COLORS[tokenType] || SYNTAX_COLORS.plain;
}

export function getLanguageInfo(language?: SupportedLanguage) {
  if (!language || !LANGUAGE_INFO[language]) {
    return LANGUAGE_INFO.plaintext;
  }
  return LANGUAGE_INFO[language];
}

export function calculatePagination(
  totalLines: number,
  linesPerPage: number,
  currentPage: number
): CodeBlockPaginationState {
  const totalPages = Math.ceil(totalLines / linesPerPage);
  const safePage = Math.max(1, Math.min(currentPage, totalPages));
  const startLine = (safePage - 1) * linesPerPage + 1;
  const endLine = Math.min(safePage * linesPerPage, totalLines);

  return {
    currentPage: safePage,
    totalPages,
    linesPerPage,
    startLine,
    endLine,
  };
}

export function getCodeLines(code: string): string[] {
  return code.split('\n');
}

export function getPaginatedCode(code: string, startLine: number, endLine: number): string {
  const lines = getCodeLines(code);
  return lines.slice(startLine - 1, endLine).join('\n');
}

export function copyToClipboard(text: string): Promise<void> {
  // Platform-specific clipboard implementation would go here
  // For now, we'll use a simple approach
  if (typeof navigator !== 'undefined' && (navigator as any).clipboard) {
    return (navigator as any).clipboard.writeText(text);
  }
  return Promise.resolve();
}

export function formatLineNumber(lineNumber: number): string {
  return lineNumber.toString().padStart(3, ' ');
}
