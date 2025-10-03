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
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'new', 'this', 'true', 'false', 'null', 'undefined', 'typeof', 'instanceof', 'break', 'continue', 'switch', 'case', 'default', 'try', 'catch', 'finally', 'throw'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'new', 'this', 'true', 'false', 'null', 'undefined', 'typeof', 'instanceof', 'interface', 'type', 'enum', 'public', 'private', 'protected', 'readonly', 'static', 'extends', 'implements', 'break', 'continue', 'switch', 'case', 'default', 'try', 'catch', 'finally', 'throw'],
    python: ['def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'lambda', 'yield', 'async', 'await', 'break', 'continue', 'pass', 'raise', 'assert', 'global', 'nonlocal'],
    java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'import', 'return', 'if', 'else', 'for', 'while', 'new', 'this', 'super', 'static', 'final', 'void', 'int', 'String', 'boolean', 'true', 'false', 'null', 'break', 'continue', 'switch', 'case', 'default', 'try', 'catch', 'finally', 'throw', 'throws'],
    go: ['package', 'import', 'func', 'return', 'if', 'else', 'for', 'range', 'type', 'struct', 'interface', 'var', 'const', 'go', 'defer', 'chan', 'select', 'case', 'default', 'true', 'false', 'nil', 'break', 'continue', 'switch', 'fallthrough', 'goto', 'map'],
    rust: ['fn', 'let', 'mut', 'const', 'struct', 'enum', 'impl', 'trait', 'use', 'mod', 'pub', 'return', 'if', 'else', 'match', 'for', 'while', 'loop', 'break', 'continue', 'true', 'false', 'Self', 'self', 'where', 'as', 'ref', 'move', 'static', 'unsafe', 'extern', 'crate'],
    markdown: ['#', '##', '###', '####', '#####', '######', '-', '*', '+', '>', '```', '---', '***', '___'],
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

  // Handle markdown specially
  if (language === 'markdown') {
    return tokenizeMarkdown(code);
  }

  // Tokenize line by line
  let position = 0;
  while (position < code.length) {
    // Match comments
    if (code.substr(position).match(/^\/\/.*/)) {
      const match = code.substr(position).match(/^\/\/.*/);
      if (match) {
        tokens.push({ type: 'comment', value: match[0] });
        position += match[0].length;
        continue;
      }
    }

    if (code.substr(position).match(/^#.*/)) {
      const match = code.substr(position).match(/^#.*/);
      if (match && (language === 'python' || language === 'bash' || language === 'shell')) {
        tokens.push({ type: 'comment', value: match[0] });
        position += match[0].length;
        continue;
      }
    }

    // Match strings (including full strings with quotes)
    if (code[position] === '"' || code[position] === "'" || code[position] === '`') {
      const quote = code[position];
      let str = quote;
      let i = position + 1;
      while (i < code.length && code[i] !== quote) {
        if (code[i] === '\\') {
          str += code[i] + (code[i + 1] || '');
          i += 2;
        } else {
          str += code[i];
          i++;
        }
      }
      if (i < code.length) str += code[i]; // closing quote
      tokens.push({ type: 'string', value: str });
      position += str.length;
      continue;
    }

    // Match numbers
    const numberMatch = code.substr(position).match(/^(\d+\.?\d*)/);
    if (numberMatch) {
      tokens.push({ type: 'number', value: numberMatch[0] });
      position += numberMatch[0].length;
      continue;
    }

    // Match identifiers and keywords
    const identMatch = code.substr(position).match(/^([a-zA-Z_]\w*)/);
    if (identMatch) {
      const word = identMatch[0];
      if (langKeywords.includes(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else {
        // Check if it's followed by ( to identify functions
        const remaining = code.substr(position + word.length).trimStart();
        if (remaining[0] === '(') {
          tokens.push({ type: 'function', value: word });
        } else {
          tokens.push({ type: 'plain', value: word });
        }
      }
      position += word.length;
      continue;
    }

    // Match operators
    const opMatch = code.substr(position).match(/^([+\-*/<>=!&|%^]+)/);
    if (opMatch) {
      tokens.push({ type: 'operator', value: opMatch[0] });
      position += opMatch[0].length;
      continue;
    }

    // Everything else (whitespace, punctuation, etc.)
    tokens.push({ type: 'plain', value: code[position] });
    position++;
  }

  return tokens;
}

// Special tokenizer for markdown
function tokenizeMarkdown(code: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  const lines = code.split('\n');

  lines.forEach((line, lineIndex) => {
    // Headers
    if (line.match(/^#{1,6}\s/)) {
      tokens.push({ type: 'keyword', value: line });
    }
    // Code blocks
    else if (line.match(/^```/)) {
      tokens.push({ type: 'operator', value: line });
    }
    // Lists
    else if (line.match(/^\s*[-*+]\s/)) {
      const match = line.match(/^(\s*[-*+]\s)/);
      if (match) {
        tokens.push({ type: 'operator', value: match[0] });
        tokens.push({ type: 'plain', value: line.slice(match[0].length) });
      }
    }
    // Bold/italic
    else if (line.match(/\*\*.*\*\*|\*.*\*|__.*__|_.*_/)) {
      let remaining = line;
      while (remaining) {
        const boldMatch = remaining.match(/^(.*?)(\*\*|__)(.*?)\2/);
        if (boldMatch) {
          if (boldMatch[1]) tokens.push({ type: 'plain', value: boldMatch[1] });
          tokens.push({ type: 'keyword', value: boldMatch[2] + boldMatch[3] + boldMatch[2] });
          remaining = remaining.slice(boldMatch[0].length);
        } else {
          tokens.push({ type: 'plain', value: remaining });
          break;
        }
      }
    }
    // Links
    else if (line.match(/\[.*?\]\(.*?\)/)) {
      let remaining = line;
      while (remaining) {
        const linkMatch = remaining.match(/^(.*?)(\[.*?\]\(.*?\))/);
        if (linkMatch) {
          if (linkMatch[1]) tokens.push({ type: 'plain', value: linkMatch[1] });
          tokens.push({ type: 'string', value: linkMatch[2] });
          remaining = remaining.slice(linkMatch[0].length);
        } else {
          tokens.push({ type: 'plain', value: remaining });
          break;
        }
      }
    }
    // Regular text
    else {
      tokens.push({ type: 'plain', value: line });
    }

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
