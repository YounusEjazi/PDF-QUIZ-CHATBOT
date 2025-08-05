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
      JSON.parse(text);
      return true;
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
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
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
        <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm">
          <code className="text-gray-800 dark:text-gray-200">
            {formatted.split('\n').map((line, index) => (
              <div key={index} className="whitespace-pre">{line}</div>
            ))}
          </code>
        </pre>
      );
    } catch {
      return <span className="text-sm">{text}</span>;
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

      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2]
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
            <code className="text-sm text-gray-800 dark:text-gray-200">
              {part.content}
            </code>
          </pre>
        );
      } else {
        return (
          <span key={index} className="text-sm whitespace-pre-wrap">
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
          <code key={index} className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">
            {part.content}
          </code>
        );
      } else {
        return (
          <span key={index} className="text-sm">
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
        <ul className="list-disc list-inside space-y-1">
          {listItems.map((item, index) => (
            <li key={index} className="text-sm">
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
        <ol className="list-decimal list-inside space-y-1">
          {listItems.map((item, index) => (
            <li key={index} className="text-sm">
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
        
        return (
          <part.Tag key={index} className={cn(
            headingClasses[part.level as keyof typeof headingClasses],
            'text-gray-900 dark:text-gray-100 mt-4 mb-2'
          )}>
            {part.content}
          </part.Tag>
        );
      } else {
        return (
          <span key={index} className="text-sm whitespace-pre-wrap">
            {part.content}
          </span>
        );
      }
    });
  };

  // Main render function
  const renderContent = () => {
    // Check if it's JSON
    if (isJSON(content)) {
      return renderJSON(content);
    }

    // Check if it's a table
    if (isTable(content)) {
      return renderTable(content);
    }

    // Check if it contains code blocks
    if (content.includes('```')) {
      return renderCodeBlock(content);
    }

    // Check if it contains headings
    if (content.includes('#')) {
      return renderHeadings(content);
    }

    // Check if it contains lists
    if (content.includes('- ') || content.includes('* ') || content.includes('+ ')) {
      return renderList(content);
    }

    // Check if it contains numbered lists
    if (content.match(/\d+\.\s/)) {
      return renderNumberedList(content);
    }

    // Check if it contains inline code
    if (content.includes('`')) {
      return renderInlineCode(content);
    }

    // Default: render as plain text
    return (
      <span className="text-sm whitespace-pre-wrap">
        {content}
      </span>
    );
  };

  return (
    <div className={cn("prose prose-sm max-w-none", className)}>
      {renderContent()}
    </div>
  );
}; 