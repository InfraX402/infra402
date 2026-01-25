1️⃣ Tailwind Prose Classes (Base Styles)
tsx
// Line 457
className="prose prose-invert max-w-none text-sm leading-relaxed"
prose – Base styles from Tailwind Typography plugin
prose-invert – Color inversion for dark theme
Automatically applies appropriate styles to headings, paragraphs, lists, blockquotes, etc.
2️⃣ Custom Component Styles (Lines 51-98)
The markdownComponents object overrides styles for specific HTML elements:

tsx
const markdownComponents: Components = {
    a: ({ ... }) => (
        <a className="text-brand-500 hover:text-brand-600 underline">...</a>
    ),
    pre: ({ ... }) => (
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg ...">...</pre>
    ),
    code: ({ ... }) => (
        <code className="bg-zinc-800/50 text-zinc-200 px-1.5 py-0.5 rounded ...">...</code>
    ),
    table: () => <table className="min-w-full divide-y divide-zinc-800" />,
    th: () => <th className="px-3 py-2 bg-zinc-800/50 ..." />,
    td: () => <td className="px-3 py-2 ... border-b border-zinc-800" />,
};
3️⃣ Inline Styles (Directly in LLM Responses)
If the LLM uses the style attribute in its response, it will be applied as-is:

html
<div style="background: #1a1a2e; padding: 16px; border-radius: 12px;">
  <span style="color: #00d4ff;">Custom styled text</span>
</div>
⚠️ Important Notes
Method	Supported	Example
Inline style	✅ Yes	<div style="color: red">
class attribute	⚠️ Limited	Only works with classes defined in the project
<style> tag	❌ Not recommended	<style>.foo {}</style> (security risk)
External CSS	❌ Not supported	<link href="...">
How to Add Styles for New Elements
For example, to add custom styles for <blockquote>:

tsx
const markdownComponents: Components = {
    // existing elements...
    
    blockquote: ({ node, ...props }) => (
        <blockquote
            {...props}
            className="border-l-4 border-brand-500 pl-4 italic text-zinc-400 my-4"
        />
    ),
};
