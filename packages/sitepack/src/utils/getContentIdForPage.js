import { isPage } from '../Page'


/**
 * Return the page ids of all pages which are required to do an eager render
 * of the given page
 */
export default function getContentIdForPage(page) {
  const result = []

  let contentPage = page
  while (contentPage.content && isPage(contentPage.content)) {
    contentPage = contentPage.content
  }

  return contentPage.id
}
