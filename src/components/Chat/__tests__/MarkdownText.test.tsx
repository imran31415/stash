import React from 'react';
import { render } from '@testing-library/react-native';
import { MarkdownText } from '../MarkdownText';

describe('MarkdownText', () => {
  describe('Rendering', () => {
    it('renders plain text', () => {
      const { getByText } = render(
        <MarkdownText content="Hello World" />
      );
      expect(getByText('Hello World')).toBeTruthy();
    });

    it('handles empty content', () => {
      const { getByText } = render(
        <MarkdownText content="" />
      );
      expect(getByText('')).toBeTruthy();
    });

    it('handles non-string content', () => {
      const { getByText } = render(
        <MarkdownText content={null as any} />
      );
      expect(getByText('')).toBeTruthy();
    });
  });

  describe('Headers', () => {
    it('renders h1 header', () => {
      const { getByText } = render(
        <MarkdownText content="# Heading 1" />
      );
      const header = getByText('Heading 1');
      expect(header).toBeTruthy();
      expect(header.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 24, fontWeight: '700' }),
        ])
      );
    });

    it('renders h2 header', () => {
      const { getByText } = render(
        <MarkdownText content="## Heading 2" />
      );
      const header = getByText('Heading 2');
      expect(header).toBeTruthy();
      expect(header.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 20, fontWeight: '700' }),
        ])
      );
    });

    it('renders h3 header', () => {
      const { getByText } = render(
        <MarkdownText content="### Heading 3" />
      );
      const header = getByText('Heading 3');
      expect(header).toBeTruthy();
      expect(header.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 18, fontWeight: '600' }),
        ])
      );
    });

    it('renders headers with inline markdown', () => {
      const { getByText } = render(
        <MarkdownText content="## **Bold** Header" />
      );
      expect(getByText('Bold')).toBeTruthy();
    });
  });

  describe('Inline Formatting', () => {
    it('renders bold text with **', () => {
      const { getByText } = render(
        <MarkdownText content="This is **bold** text" />
      );
      const boldText = getByText('bold');
      expect(boldText).toBeTruthy();
      expect(boldText.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ fontWeight: '700' })])
      );
    });

    it('renders bold text with __', () => {
      const { getByText } = render(
        <MarkdownText content="This is __bold__ text" />
      );
      const boldText = getByText('bold');
      expect(boldText).toBeTruthy();
      expect(boldText.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ fontWeight: '700' })])
      );
    });

    it('renders italic text with *', () => {
      const { getByText } = render(
        <MarkdownText content="This is *italic* text" />
      );
      const italicText = getByText('italic');
      expect(italicText).toBeTruthy();
      expect(italicText.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ fontStyle: 'italic' })])
      );
    });

    it('renders italic text with _', () => {
      const { getByText } = render(
        <MarkdownText content="This is _italic_ text" />
      );
      const italicText = getByText('italic');
      expect(italicText).toBeTruthy();
      expect(italicText.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ fontStyle: 'italic' })])
      );
    });

    it('renders inline code', () => {
      const { getByText } = render(
        <MarkdownText content="Use `console.log()` to debug" />
      );
      const code = getByText('console.log()');
      expect(code).toBeTruthy();
      expect(code.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        })
      );
    });
  });

  describe('Complex Formatting', () => {
    it('renders mixed inline formatting', () => {
      const { getByText } = render(
        <MarkdownText content="**Bold** and *italic* with `code`" />
      );
      expect(getByText('Bold')).toBeTruthy();
      expect(getByText('italic')).toBeTruthy();
      expect(getByText('code')).toBeTruthy();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom color', () => {
      const { getByText } = render(
        <MarkdownText content="Colored text" color="#FF0000" />
      );
      const text = getByText('Colored text');
      expect(text.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: '#FF0000' })])
      );
    });

    it('applies custom style prop', () => {
      const customStyle = { fontSize: 20 };
      const { getByText } = render(
        <MarkdownText content="Custom style" style={customStyle} />
      );
      const text = getByText('Custom style');
      expect(text.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ fontSize: 20 })])
      );
    });

    it('uses default black color when not specified', () => {
      const { getByText } = render(
        <MarkdownText content="Default color" />
      );
      const text = getByText('Default color');
      expect(text.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: '#000000' })])
      );
    });
  });
});
