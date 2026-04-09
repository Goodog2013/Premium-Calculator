type UnlistenFn = () => void

function isClientSide(): boolean {
  return typeof window !== 'undefined'
}

export function isTauriEnvironment(): boolean {
  return isClientSide() && '__TAURI_INTERNALS__' in window
}

async function getCurrentAppWindow() {
  if (!isTauriEnvironment()) return null

  const module = await import('@tauri-apps/api/window')
  return module.getCurrentWindow()
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}

export async function minimizeWindow(): Promise<void> {
  try {
    const appWindow = await getCurrentAppWindow()
    if (!appWindow) return
    await appWindow.minimize()
  } catch {
    // Ignore desktop binding errors in unsupported environments.
  }
}

export async function toggleMaximizeWindow(): Promise<void> {
  try {
    const appWindow = await getCurrentAppWindow()
    if (!appWindow) return
    await appWindow.toggleMaximize()
  } catch {
    // Ignore desktop binding errors in unsupported environments.
  }
}

export async function closeWindow(): Promise<void> {
  try {
    const appWindow = await getCurrentAppWindow()
    if (!appWindow) return
    await appWindow.close()
  } catch {
    // Ignore desktop binding errors in unsupported environments.
  }
}

export async function isWindowMaximized(): Promise<boolean> {
  try {
    const appWindow = await getCurrentAppWindow()
    if (!appWindow) return false
    return await appWindow.isMaximized()
  } catch {
    return false
  }
}

export async function subscribeWindowResize(
  onResize: () => void,
): Promise<UnlistenFn> {
  try {
    const appWindow = await getCurrentAppWindow()
    if (!appWindow) return () => {}
    return await appWindow.onResized(onResize)
  } catch {
    return () => {}
  }
}
