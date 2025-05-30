import TurndownService from 'turndown'

export function getThreadAsMarkdown(): string {
  const $firstArticle = document.querySelector<HTMLElement>('article')
  if (!$firstArticle) {
    throw new Error('No <article> element found on this page.')
  }
  const $articlesWrapper = $firstArticle.parentElement
  if (!$articlesWrapper) {
    throw new Error('<article> has no ancestor <div>.')
  }

  const turndown = new TurndownService({ headingStyle: 'atx' })

  return turndown.turndown($articlesWrapper.outerHTML)
}
