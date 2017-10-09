import { createJunction } from 'junctions'


export default function sitepackReactTransform() {
  return site => {
    const junctions = {}

    return site.map(page => {
      if (!page.children || page.children.length === 0) {
        return page.consume('title')
      }

      const branches = {}
      for (let i = 0, len = page.children.length; i < len; i++) {
        const child = page.children[i]

        branches[child.id] = {
          default: child.path == page.default,
          path: child.path,
          next: junctions[child.id] || null,
          data: {
            pageId: child.id,
          },
        }
      }

      if (page.content && junctions[page.content.id]) {
        branches[page.content.id] = {
          intermediate: !!page.content.absolutePath,
          path: page.content.path,
          data: {
            pageId: page.content.id,
          },

          // Site#map is gauranteed to iterate in an order that results in
          // children being processed before their parents, so this works.
          next: junctions[page.content.id],
        }
      }

      const junction = createJunction(branches)
      junctions[page.id] = junction
      return page.set({ junction }).consume('junction', 'default', 'title')
    })
  }
}
