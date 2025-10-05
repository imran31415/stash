import { ReactNode } from 'react';

export interface DemoConfig<T = any> {
  id: string;
  title: string;
  description: string;
  initialCode: string;
  implementationCode: string;
  parseData: (code: string) => T | null;
  renderPreview: (data: T) => ReactNode;
}
