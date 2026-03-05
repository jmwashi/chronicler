import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { WikiText } from './WikiText'

/**
 * Recursively walks React children and replaces string nodes
 * with WikiText-rendered spans (resolving [[wikilinks]]).
 */
function WikiTextChildren({ children }: { children: React.ReactNode }) {
  return (
    <>
      {React.Children.map(children, (child) => {
        if (typeof child === 'string') return <WikiText text={child} />
        if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
          return React.cloneElement(child, {}, <WikiTextChildren>{child.props.children}</WikiTextChildren>)
        }
        return child
      })}
    </>
  )
}

export function MarkdownView({ content }: { content: string }) {
  if (!content) return null

  return (
    <div className="markdown-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-2 leading-relaxed">
              <WikiTextChildren>{children}</WikiTextChildren>
            </p>
          ),
          li: ({ children, ...props }) => (
            <li {...props}>
              <WikiTextChildren>{children}</WikiTextChildren>
            </li>
          ),
          td: ({ children, ...props }) => (
            <td {...props} className="border px-2 py-1" style={{ borderColor: 'hsl(var(--border))' }}>
              <WikiTextChildren>{children}</WikiTextChildren>
            </td>
          ),
          th: ({ children, ...props }) => (
            <th
              {...props}
              className="border px-2 py-1 text-left font-semibold"
              style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--muted))' }}
            >
              <WikiTextChildren>{children}</WikiTextChildren>
            </th>
          ),
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-4 mb-2" style={{ color: 'hsl(var(--foreground))' }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold mt-3 mb-1.5" style={{ color: 'hsl(var(--foreground))' }}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold mt-2 mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              {children}
            </h3>
          ),
          ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-0.5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-0.5">{children}</ol>,
          blockquote: ({ children }) => (
            <blockquote
              className="border-l-2 pl-3 my-2 italic"
              style={{ borderColor: 'hsl(var(--primary))', color: 'hsl(var(--muted-foreground))' }}
            >
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.startsWith('language-')
            if (isBlock) {
              return (
                <code
                  className="block rounded-md p-3 my-2 text-sm overflow-x-auto"
                  style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
                >
                  {children}
                </code>
              )
            }
            return (
              <code
                className="rounded px-1 py-0.5 text-sm"
                style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
              >
                {children}
              </code>
            )
          },
          pre: ({ children }) => <pre className="my-2">{children}</pre>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table
                className="w-full text-sm border-collapse border"
                style={{ borderColor: 'hsl(var(--border))' }}
              >
                {children}
              </table>
            </div>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-70"
              style={{ color: 'hsl(var(--primary))' }}
            >
              {children}
            </a>
          ),
          hr: () => (
            <hr className="my-3 border-t" style={{ borderColor: 'hsl(var(--border))' }} />
          ),
          input: ({ checked, ...props }) => (
            <input
              {...props}
              checked={checked}
              disabled
              type="checkbox"
              className="mr-1.5 align-middle"
            />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
