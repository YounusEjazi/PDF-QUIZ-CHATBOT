import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";
import remarkGfm from "remark-gfm";
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

  // Function to render JSON with syntax highlighting
  const renderJSON = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);
      
      return (
        <div className="my-4">
          <SyntaxHighlighter
            language="json"
            style={github}
            showLineNumbers={false}
          >
            {formatted}
          </SyntaxHighlighter>
        </div>
      );
    } catch {
      return <span className="text-sm break-words">{text}</span>;
    }
  };

  // Function to clean up malformed tables
  const cleanTableMarkdown = (text: string): string => {
    const lines = text.split('\n');
    const cleanedLines = lines.map(line => {
      // Remove extra leading pipes
      if (line.trim().startsWith('|') && line.trim().length > 1) {
        return line.trim();
      }
      return line;
    });
    return cleanedLines.join('\n');
  };

  // Main render function
  const renderContent = () => {
    // Clean up the content first
    const cleanedContent = cleanTableMarkdown(content);

    // Check if this should be shown as JSON
    if (shouldShowAsJSON(cleanedContent)) {
      // If it's wrapped in code blocks, render as markdown
      if (cleanedContent.includes('```json')) {
        return (
          <ReactMarkdown
            className="markdown-body"
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                  <SyntaxHighlighter
                    style={github}
                    language={match[1]}
                    PreTag="div"
                    showLineNumbers={false}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className={cn(
                      "bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700",
                      className
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              table({ children, ...props }) {
                return (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm" {...props}>
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children, ...props }) {
                return (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" {...props}>
                    {children}
                  </th>
                );
              },
              td({ children, ...props }) {
                return (
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700" {...props}>
                    {children}
                  </td>
                );
              },
            }}
          >
            {cleanedContent}
          </ReactMarkdown>
        );
      }
      
      // If it's pure JSON, render as JSON
      if (isJSON(cleanedContent)) {
        return renderJSON(cleanedContent);
      }
    }

    // Check if it contains mixed content (markdown + JSON)
    if (cleanedContent.includes('{') && cleanedContent.includes('}') && cleanedContent.includes('"') && 
        (cleanedContent.includes('#') || cleanedContent.includes('```') || cleanedContent.includes('- ') || cleanedContent.includes('* ') || cleanedContent.includes('+ ') || cleanedContent.match(/\d+\.\s/))) {
      const { jsonPart, markdownPart } = extractJSONFromMixedContent(cleanedContent);
      
      // If we have a valid JSON part, extract the answer and render markdown
      if (jsonPart && isJSON(jsonPart)) {
        try {
          const parsed = JSON.parse(jsonPart);
          if (parsed.answer) {
            // Render the answer as markdown
            return (
              <ReactMarkdown
                className="markdown-body"
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <SyntaxHighlighter
                        style={github}
                        language={match[1]}
                        PreTag="div"
                        showLineNumbers={false}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className={cn(
                          "bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700",
                          className
                        )}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  table({ children, ...props }) {
                    return (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm" {...props}>
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th({ children, ...props }) {
                    return (
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" {...props}>
                        {children}
                      </th>
                    );
                  },
                  td({ children, ...props }) {
                    return (
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700" {...props}>
                        {children}
                      </td>
                    );
                  },
                }}
              >
                {parsed.answer}
              </ReactMarkdown>
            );
          }
        } catch {
          // Fall back to rendering the original content as markdown
        }
      }
      
      // If no valid JSON found, render as markdown
      return (
        <ReactMarkdown
          className="markdown-body"
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return match ? (
                <SyntaxHighlighter
                  style={github}
                  language={match[1]}
                  PreTag="div"
                  showLineNumbers={false}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code
                  className={cn(
                    "bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700",
                    className
                  )}
                  {...props}
                >
                  {children}
                </code>
              );
            },
            table({ children, ...props }) {
              return (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm" {...props}>
                    {children}
                  </table>
                </div>
              );
            },
            th({ children, ...props }) {
              return (
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" {...props}>
                  {children}
                </th>
              );
            },
            td({ children, ...props }) {
              return (
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700" {...props}>
                  {children}
                </td>
              );
            },
          }}
        >
          {markdownPart || cleanedContent}
        </ReactMarkdown>
      );
    }

    // Check if it's pure JSON (this should catch direct JSON responses)
    if (isJSON(cleanedContent)) {
      return renderJSON(cleanedContent);
    }

    // Otherwise, render as markdown content
    return (
      <ReactMarkdown
        className="markdown-body"
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <SyntaxHighlighter
                style={github}
                language={match[1]}
                PreTag="div"
                showLineNumbers={false}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code
                className={cn(
                  "bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700",
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          th({ children, ...props }) {
            return (
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" {...props}>
                {children}
              </th>
            );
          },
          td({ children, ...props }) {
            return (
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700" {...props}>
                {children}
              </td>
            );
          },
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    );
  };

  return (
    <div className={cn("markdown-container text-gray-900 dark:text-gray-100", className)}>
      {renderContent()}
      <style jsx>{`
        .markdown-container {
          font-size: 14px !important;
          line-height: 1.7;
          word-break: break-word;
        }

        .markdown-body {
          font-size: 14px !important;
          line-height: 1.7;
          word-break: break-word;
        }

        /* Headings */
        .markdown-body h1,
        .markdown-body.markdown-body h1 {
          font-size: 1.09em;
          font-weight: 600;
          margin-top: 1.1em;
          margin-bottom: 0.4em;
          color: #1a1a1a;
        }

        .markdown-body h2,
        .markdown-body.markdown-body h2 {
          font-size: 1.07em;
          font-weight: 600;
          margin-top: 1.1em;
          margin-bottom: 0.4em;
          color: #1a1a1a;
        }

        .markdown-body h3,
        .markdown-body.markdown-body h3 {
          font-size: 1.05em;
          font-weight: 600;
          margin-top: 1.1em;
          margin-bottom: 0.4em;
          color: #1a1a1a;
        }

        .markdown-body h4,
        .markdown-body.markdown-body h4 {
          font-size: 1.03em;
          font-weight: 600;
          margin-top: 1.1em;
          margin-bottom: 0.4em;
          color: #1a1a1a;
        }

        .markdown-body h1,
        .markdown-body h2,
        .markdown-body h3,
        .markdown-body h4 {
          font-weight: 600;
          margin-top: 1.1em;
          margin-bottom: 0.4em;
        }

        /* Paragraphs */
        .markdown-body p {
          margin: 1em 0;
          line-height: 1.6;
        }

        /* Links */
        .markdown-body a {
          color: #0a7cff;
          text-decoration: underline;
          word-break: break-all;
        }

        .markdown-body a:hover {
          color: #0056b3;
        }

        /* Inline code */
        .markdown-body code {
          background: #f6f8fa;
          color: #d6336c;
          border-radius: 6px;
          padding: 0.2em 0.4em;
          font-size: 0.97em;
          font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
          border: 1px solid #e1e4e8;
        }

        /* Code blocks */
        .markdown-body pre {
          background: #f6f8fa;
          border-radius: 8px;
          padding: 1em;
          overflow-x: auto;
          margin: 1.2em 0;
          font-size: 0.98em;
          font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
          border: 1px solid #e1e4e8;
        }

        .markdown-body pre code {
          background: none;
          color: inherit;
          padding: 0;
          font-size: inherit;
          border: none;
        }

        /* Blockquotes */
        .markdown-body blockquote {
          border-left: 4px solid #b3b3b3;
          background: #f9f9fa;
          color: #555;
          padding: 0.7em 1em;
          margin: 1.2em 0;
          border-radius: 6px;
          font-style: italic;
        }

        /* Lists */
        .markdown-body ul,
        .markdown-body ol {
          margin: 1em 0 1em 1.5em;
          padding: 0;
        }

        .markdown-body li {
          margin: 0.3em 0;
          line-height: 1.6;
        }

        /* Tables */
        .markdown-body table {
          border-collapse: collapse;
          margin: 0;
          background: #fff;
          width: 100%;
          overflow-x: auto;
        }

        .markdown-body th,
        .markdown-body td {
          border: 1px solid #e2e2e2;
          padding: 0.5em 0.8em;
          text-align: left;
        }

        .markdown-body th {
          background: #f6f8fa;
          font-weight: 600;
        }

        /* Table wrapper for horizontal scrolling */
        .markdown-table-wrapper {
          overflow-x: auto !important;
          overflow-y: auto !important;
          max-height: 400px;
          width: 100% !important;
          max-width: 100% !important;
        }

        .markdown-table-wrapper table {
          min-width: 1200px !important;
          width: max-content !important;
          border-collapse: collapse;
          background: #fff;
        }

        .markdown-table-wrapper th,
        .markdown-table-wrapper td {
          white-space: nowrap;
        }

        /* Scrollbar styling */
        .markdown-table-wrapper::-webkit-scrollbar {
          height: 6px;
          width: 6px;
          background: transparent;
          border-radius: 6px;
        }

        .markdown-table-wrapper::-webkit-scrollbar-thumb {
          background: #b3b3b3;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .markdown-table-wrapper::-webkit-scrollbar-thumb:hover {
          background: #999999;
        }

        .markdown-table-wrapper::-webkit-scrollbar-corner {
          background: transparent;
        }

        .markdown-table-wrapper {
          scrollbar-width: thin;
          scrollbar-color: #b3b3b3 transparent;
        }

        /* Dark mode support */
        .dark .markdown-body {
          color: #e5e7eb;
        }

        .dark .markdown-body h1,
        .dark .markdown-body h2,
        .dark .markdown-body h3,
        .dark .markdown-body h4 {
          color: #f9fafb;
        }

        .dark .markdown-body code {
          background: #374151;
          color: #f3f4f6;
          border-color: #4b5563;
        }

        .dark .markdown-body pre {
          background: #374151;
          border-color: #4b5563;
        }

        .dark .markdown-body blockquote {
          background: #374151;
          color: #d1d5db;
          border-left-color: #6b7280;
        }

        .dark .markdown-body table {
          background: #1f2937;
        }

        .dark .markdown-body th,
        .dark .markdown-body td {
          border-color: #4b5563;
          color: #f9fafb;
        }

        .dark .markdown-body th {
          background: #374151;
        }

        /* Chat content specific styles */
        .chat-content,
        .bot {
          min-width: 0 !important;
          overflow-x: visible !important;
        }
      `}</style>
    </div>
  );
}; 