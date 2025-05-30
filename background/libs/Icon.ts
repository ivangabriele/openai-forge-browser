export class Icon {
  #animationIndex = 0
  #isAscending = true
  #timeout: NodeJS.Timeout | undefined = undefined

  async animate() {
    const animationKey = String(this.#animationIndex + 1).padStart(2, '0')
    const iconPath = `/assets/icons/a${animationKey}.png`

    try {
      await chrome.action.setIcon({
        path: iconPath,
      })
    } catch (err) {
      console.error('[ERROR]', err)
    }

    if (this.#isAscending) {
      if (this.#animationIndex < 13) {
        this.#animationIndex += 1
      } else {
        this.#animationIndex -= 1
        this.#isAscending = false
      }
    } else if (this.#animationIndex > 0) {
      this.#animationIndex -= 1
    } else {
      this.#animationIndex += 1
      this.#isAscending = true
    }

    // Continue the loop
    this.#timeout = setTimeout(() => this.animate(), 200)
  }

  async stop() {
    if (this.#timeout) {
      clearTimeout(this.#timeout)
    }

    this.#animationIndex = 0

    try {
      await chrome.action.setIcon({
        path: '/assets/icons/x48.png',
      })
    } catch (err) {
      console.error('[ERROR]', err)
    }
  }
}
