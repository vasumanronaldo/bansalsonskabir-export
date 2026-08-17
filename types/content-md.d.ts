// `.md` files are imported as raw strings (see next.config.ts webpack rule) so
// the file-based content is bundled for Cloudflare Workers (no runtime fs).
declare module '*.md' {
  const content: string
  export default content
}
