export async function getCurrentTabId(): Promise<number> {
  const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (!currentTab?.id) {
    throw new Error('No active tab found')
  }

  return currentTab.id
}
