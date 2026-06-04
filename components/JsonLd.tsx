// Server component for JSON-LD structured data. Renders as a <script>
// tag with type="application/ld+json" — Google + AI search crawlers (Perplexity,
// ChatGPT browse) parse this for rich-result snippets and citation answers.
//
// React 19 / Next 16 supports rendering script children directly. We escape
// `<` to prevent any chance of script-end-tag injection through dynamic
// product strings, even though the input is always JSON-typed from our own
// objects.
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c")
  return (
    <script type="application/ld+json" suppressHydrationWarning>
      {json}
    </script>
  )
}
