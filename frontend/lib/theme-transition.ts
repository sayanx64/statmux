export type Theme = 'light' | 'dark'

export type ThemeTriggerOrigin =
  | HTMLElement
  | React.MouseEvent<HTMLElement>
  | MouseEvent
  | { x: number; y: number }
  | null
  | undefined

/**
 * Resolves the background color for the target theme dynamically from CSS custom properties.
 */
export function getThemeBackgroundColor(targetTheme: Theme): string {
  if (typeof document === 'undefined') {
    return targetTheme === 'dark' ? 'oklch(0.165 0.008 260)' : 'oklch(0.985 0.002 247)'
  }

  // Create an off-screen probe element to read the computed target variable
  const probe = document.createElement('div')
  probe.style.display = 'none'
  if (targetTheme === 'dark') {
    probe.classList.add('dark')
  } else {
    probe.classList.remove('dark')
  }
  document.documentElement.appendChild(probe)

  const computedStyle = window.getComputedStyle(probe)
  const bgVar = computedStyle.getPropertyValue('--background').trim()
  document.documentElement.removeChild(probe)

  if (bgVar) {
    return bgVar.startsWith('oklch') || bgVar.startsWith('#') || bgVar.startsWith('rgb')
      ? bgVar
      : `var(--background)`
  }

  return targetTheme === 'dark' ? 'oklch(0.165 0.008 260)' : 'oklch(0.985 0.002 247)'
}

/**
 * Resolves the accent token colors (emerald, blue, amber) for the sparks.
 */
export function getAccentTokens(): { emerald: string; blue: string; amber: string } {
  if (typeof document === 'undefined') {
    return { emerald: '#34d399', blue: '#60a5fa', amber: '#fbbf24' }
  }

  const rootStyle = window.getComputedStyle(document.documentElement)
  const success = rootStyle.getPropertyValue('--success').trim() || '#34d399'
  const info = rootStyle.getPropertyValue('--info').trim() || '#60a5fa'
  const warning = rootStyle.getPropertyValue('--warning').trim() || '#fbbf24'

  return {
    emerald: success,
    blue: info,
    amber: warning,
  }
}

/**
 * Spawns the logo-shaped "bubble reveal" theme transition animation and
 * flips the theme on transitionend.
 */
export function runThemeBubbleTransition(
  targetTheme: Theme,
  origin: ThemeTriggerOrigin,
  onComplete: (theme: Theme) => void,
) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    onComplete(targetTheme)
    return
  }

  // Check prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced || !origin) {
    onComplete(targetTheme)
    return
  }

  // Compute origin coordinate (center of clicked element or point)
  let x = window.innerWidth / 2
  let y = window.innerHeight / 2

  if (origin && typeof origin === 'object') {
    if ('currentTarget' in origin && origin.currentTarget instanceof HTMLElement) {
      const rect = origin.currentTarget.getBoundingClientRect()
      x = rect.left + rect.width / 2
      y = rect.top + rect.height / 2
    } else if ('getBoundingClientRect' in origin && typeof origin.getBoundingClientRect === 'function') {
      const rect = (origin as HTMLElement).getBoundingClientRect()
      x = rect.left + rect.width / 2
      y = rect.top + rect.height / 2
    } else if ('clientX' in origin && typeof origin.clientX === 'number') {
      x = origin.clientX
      y = origin.clientY
    } else if ('x' in origin && typeof origin.x === 'number') {
      x = origin.x
      y = origin.y
    }
  }

  // Read target background dynamically
  const targetBg = getThemeBackgroundColor(targetTheme)
  const accents = getAccentTokens()

  // Calculate viewport diagonal coverage scale: scale = (viewport diagonal * 2.3) / 60
  const viewportDiagonal = Math.hypot(window.innerWidth, window.innerHeight)
  const maxScale = Math.max(8, (viewportDiagonal * 2.3) / 60)

  // Full-screen overlay container
  const container = document.createElement('div')
  container.setAttribute('aria-hidden', 'true')
  container.style.position = 'fixed'
  container.style.inset = '0'
  container.style.pointerEvents = 'none'
  container.style.zIndex = '99999'
  container.style.overflow = 'hidden'

  // Logo-shaped 60px bubble (border-radius: 22% creates the squircle logo shape)
  const bubble = document.createElement('div')
  bubble.style.position = 'absolute'
  bubble.style.left = `${x - 30}px`
  bubble.style.top = `${y - 30}px`
  bubble.style.width = '60px'
  bubble.style.height = '60px'
  bubble.style.borderRadius = '22%'
  bubble.style.backgroundColor = targetBg
  bubble.style.transform = 'scale(0)'
  bubble.style.transformOrigin = 'center center'
  bubble.style.transition = 'transform 620ms cubic-bezier(0.22, 0.61, 0.36, 1)'
  bubble.style.willChange = 'transform'
  container.appendChild(bubble)

  // 3 small spark dots bursting outward
  const sparkConfigs = [
    { color: accents.emerald, dx: 44, dy: -36 },
    { color: accents.blue, dx: 48, dy: 38 },
    { color: accents.amber, dx: -52, dy: 16 },
  ]

  const sparkElements: HTMLDivElement[] = []
  sparkConfigs.forEach((cfg) => {
    const spark = document.createElement('div')
    spark.style.position = 'absolute'
    spark.style.left = `${x - 3.5}px`
    spark.style.top = `${y - 3.5}px`
    spark.style.width = '7px'
    spark.style.height = '7px'
    spark.style.borderRadius = '50%'
    spark.style.backgroundColor = cfg.color
    spark.style.transform = 'translate(0px, 0px) scale(0.6)'
    spark.style.opacity = '1'
    spark.style.transition =
      'transform 450ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 450ms ease-out'
    spark.style.willChange = 'transform, opacity'
    container.appendChild(spark)
    sparkElements.push(spark)
  })

  document.body.appendChild(container)

  // Force reflow
  void bubble.offsetHeight

  // Trigger animations in next frame
  requestAnimationFrame(() => {
    bubble.style.transform = `scale(${maxScale})`
    sparkConfigs.forEach((cfg, idx) => {
      sparkElements[idx].style.transform = `translate(${cfg.dx}px, ${cfg.dy}px) scale(1.2)`
      sparkElements[idx].style.opacity = '0'
    })
  })

  let finished = false
  const completeTransition = () => {
    if (finished) return
    finished = true
    onComplete(targetTheme)
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  }

  bubble.addEventListener('transitionend', completeTransition, { once: true })
  // Safety fallback if tab loses focus or animation interrupted
  setTimeout(completeTransition, 700)
}
