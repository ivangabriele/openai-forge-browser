export async function downloadMarkdownFile(source: string, title: string): Promise<void> {
  const blob = new Blob([source], { type: 'text/markdown' })
  const objectUrl = URL.createObjectURL(blob)

  await chrome.downloads.download({
    url: objectUrl,
    filename: `${title}.md`,
    saveAs: false,
  })

  URL.revokeObjectURL(objectUrl)
}
