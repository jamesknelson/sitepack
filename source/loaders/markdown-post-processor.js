export default function markdownPostProcessor(html) {
  const processor = (page, pages) => {
    return html.replace(/%%%SITEPACK_LINK%%%(\/[\S]+)%%%END_SITEPACK_LINK%%%/g, (_, href) => {
      const [id, hash] = href.split('#')
      const linkedPage = pages[id]
      if (linkedPage) {
        let newHref = linkedPage.absolutePath
        if (hash) newHref += '#'+hash
        return newHref
      }
      else {
        console.warn(`Link "${id}" from markdown file "${page.id}" was a 404!`)
        return '#'
      }
    })
  }

  return processor
}
