import React from "react";
import { cn } from "@/lib/utils/utils";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className 
}) => {
  // Function to detect if content is JSON
  const isJSON = (text: string): boolean => {
    try {
      const trimmed = text.trim();
      // Only treat as JSON if it starts and ends with braces/brackets
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
          (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        JSON.parse(trimmed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Function to detect if content is a table
  const isTable = (text: string): boolean => {
    const lines = text.trim().split('\n');
    return lines.some(line => line.includes('|')) && 
           lines.length > 1 && 
           lines.some(line => line.includes('---'));
  };

  // Function to parse and render table
  const renderTable = (text: string) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const tableLines = lines.filter(line => line.includes('|'));
    
    if (tableLines.length < 2) return text;

    const headers = tableLines[0].split('|').map(cell => cell.trim()).filter(cell => cell);
    const dataRows = tableLines.slice(2).map(line => 
      line.split('|').map(cell => cell.trim()).filter(cell => cell)
    );

    return (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 break-words">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 break-words">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Function to render JSON with syntax highlighting
  const renderJSON = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);
      
      return (
        <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm my-2">
          <code className="text-gray-800 dark:text-gray-200 font-mono">
            {formatted.split('\n').map((line, index) => (
              <div key={index} className="whitespace-pre">{line}</div>
            ))}
          </code>
        </pre>
      );
    } catch {
      return <span className="text-sm break-words">{text}</span>;
    }
  };

  // Function to render code blocks
  const renderCodeBlock = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }

      // Check if this is a JSON code block
      const language = match[1] || 'text';
      const codeContent = match[2];
      
      // Always render code blocks as formatted code, don't extract JSON content
      parts.push({
        type: 'code',
        language,
        content: codeContent
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    return parts.map((part, index) => {
      if (part.type === 'code') {
        return (
          <pre key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto my-2">
            <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">
              {part.content}
            </code>
          </pre>
        );
      } else {
        return (
          <span key={index} className="text-sm whitespace-pre-wrap break-words">
            {part.content}
          </span>
        );
      }
    });
  };

  // Function to render inline code
  const renderInlineCode = (text: string) => {
    const inlineCodeRegex = /`([^`]+)`/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = inlineCodeRegex.exec(text)) !== null) {
      // Add text before inline code
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }

      // Add inline code
      parts.push({
        type: 'inlineCode',
        content: match[1]
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    return parts.map((part, index) => {
      if (part.type === 'inlineCode') {
        return (
          <code key={index} className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
            {part.content}
          </code>
        );
      } else {
        return (
          <span key={index} className="text-sm break-words">
            {part.content}
          </span>
        );
      }
    });
  };

  // Function to render lists
  const renderList = (text: string) => {
    const lines = text.split('\n');
    const listItems = lines.filter(line => line.trim().match(/^[-*+]\s/));
    
    if (listItems.length > 0) {
      return (
        <ul className="list-disc list-inside space-y-2 my-4 pl-4">
          {listItems.map((item, index) => (
            <li key={index} className="text-sm break-words text-gray-900 dark:text-gray-100">
              {item.replace(/^[-*+]\s/, '')}
            </li>
          ))}
        </ul>
      );
    }
    
    return text;
  };

  // Function to render numbered lists
  const renderNumberedList = (text: string) => {
    const lines = text.split('\n');
    const listItems = lines.filter(line => line.trim().match(/^\d+\.\s/));
    
    if (listItems.length > 0) {
      return (
        <ol className="list-decimal list-inside space-y-2 my-4 pl-4">
          {listItems.map((item, index) => (
            <li key={index} className="text-sm break-words text-gray-900 dark:text-gray-100">
              {item.replace(/^\d+\.\s/, '')}
            </li>
          ))}
        </ol>
      );
    }
    
    return text;
  };

  // Function to render headings
  const renderHeadings = (text: string) => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = headingRegex.exec(text)) !== null) {
      // Add text before heading
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }

      // Add heading
      const level = match[1].length;
      const headingText = match[2];
      const Tag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
      
      parts.push({
        type: 'heading',
        level,
        content: headingText,
        Tag
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    return parts.map((part, index) => {
      if (part.type === 'heading') {
        const headingClasses = {
          1: 'text-2xl font-bold',
          2: 'text-xl font-bold',
          3: 'text-lg font-semibold',
          4: 'text-base font-semibold',
          5: 'text-sm font-semibold',
          6: 'text-sm font-medium'
        };
        
        const Tag = part.Tag as keyof JSX.IntrinsicElements;
        return (
          <Tag key={index} className={cn(
            headingClasses[part.level as keyof typeof headingClasses],
            'text-gray-900 dark:text-gray-100 mt-4 mb-2 break-words'
          )}>
            {part.content}
          </Tag>
        );
      } else {
        return (
          <span key={index} className="text-sm whitespace-pre-wrap break-words">
            {part.content}
          </span>
        );
      }
    });
  };

  // Function to detect if content contains both markdown and JSON
  const hasMixedContent = (text: string): boolean => {
    const hasMarkdown = text.includes('#') || text.includes('```') || text.includes('- ') || text.includes('* ') || text.includes('+ ') || (text.match(/\d+\.\s/) !== null);
    const hasJSON = (text.includes('{') && text.includes('}') && text.includes('"')) || text.includes('```json');
    return hasMarkdown && hasJSON;
  };

  // Function to detect if this is a JSON response that should be shown as JSON
  const shouldShowAsJSON = (text: string): boolean => {
    // If it's wrapped in code blocks with json language, show as JSON
    if (text.includes('```json')) {
      return true;
    }
    
    // If it's pure JSON and looks like a structured response, show as JSON
    if (isJSON(text) && text.includes('"answer"')) {
      return true;
    }
    
    // If it's pure JSON and user asked for JSON, show as JSON
    if (isJSON(text)) {
      return true;
    }
    
    return false;
  };

  // Function to extract JSON from mixed content
  const extractJSONFromMixedContent = (text: string): { jsonPart: string | null, markdownPart: string } => {
    // First, check for JSON in code blocks
    const codeBlockMatch = text.match(/```json\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      const jsonContent = codeBlockMatch[1];
      if (isJSON(jsonContent)) {
        try {
          const parsed = JSON.parse(jsonContent);
          if (parsed.answer) {
            const markdownPart = text.replace(codeBlockMatch[0], '').trim();
            return { jsonPart: jsonContent, markdownPart };
          }
        } catch {
          // Continue to other checks
        }
      }
    }
    
    // Check for inline JSON
    const jsonMatch = text.match(/\{[^{}]*"answer"[^{}]*\}/);
    if (jsonMatch) {
      const jsonPart = jsonMatch[0];
      const markdownPart = text.replace(jsonMatch[0], '').trim();
      return { jsonPart, markdownPart };
    }
    
    return { jsonPart: null, markdownPart: text };
  };

  // Main render function
  const renderContent = () => {
    // Check if this should be shown as JSON
    if (shouldShowAsJSON(content)) {
      // If it's wrapped in code blocks, render as code block
      if (content.includes('```json')) {
        return renderMarkdownContent(content);
      }
      
      // If it's pure JSON, render as JSON
      if (isJSON(content)) {
        return renderJSON(content);
      }
    }

    // Check if it contains mixed content (markdown + JSON)
    if (hasMixedContent(content)) {
      const { jsonPart, markdownPart } = extractJSONFromMixedContent(content);
      
      // If we have a valid JSON part, extract the answer and render markdown
      if (jsonPart && isJSON(jsonPart)) {
        try {
          const parsed = JSON.parse(jsonPart);
          if (parsed.answer) {
            // Render the answer as markdown
            return renderMarkdownContent(parsed.answer);
          }
        } catch {
          // Fall back to rendering the original content as markdown
          return renderMarkdownContent(content);
        }
      }
      
      // If no valid JSON found, render as markdown
      return renderMarkdownContent(markdownPart || content);
    }

    // Check if it's pure JSON (this should catch direct JSON responses)
    if (isJSON(content)) {
      return renderJSON(content);
    }

    // Otherwise, render as markdown content
    return renderMarkdownContent(content);
  };

  // Function to render markdown content
  const renderMarkdownContent = (text: string) => {
    // Check if it's a table
    if (isTable(text)) {
      return renderTable(text);
    }

    // Check if it contains code blocks
    if (text.includes('```')) {
      return renderCodeBlock(text);
    }

    // Check if it contains headings
    if (text.includes('#')) {
      return renderHeadings(text);
    }

    // Check if it contains lists
    if (text.includes('- ') || text.includes('* ') || text.includes('+ ')) {
      return renderList(text);
    }

    // Check if it contains numbered lists
    if (text.match(/\d+\.\s/)) {
      return renderNumberedList(text);
    }

    // Check if it contains inline code
    if (text.includes('`')) {
      return renderInlineCode(text);
    }

    // Default: render as plain text
    return (
      <span className="text-sm whitespace-pre-wrap break-words">
        {text}
      </span>
    );
  };

  return (
    <div className={cn("prose prose-sm max-w-none break-words", className)}>
      {renderContent()}
    </div>
  );
}; 