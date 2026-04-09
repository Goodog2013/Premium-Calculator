import { useEffect } from 'react'
import { useCalculatorStore } from '../state/calculatorStore'

function shouldIgnoreKeyboardEvent(event: KeyboardEvent): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey) return true

  const target = event.target as HTMLElement | null
  if (!target) return false

  if (target instanceof HTMLInputElement) return true
  if (target instanceof HTMLTextAreaElement) return true
  if (target instanceof HTMLSelectElement) return true
  if (target.isContentEditable) return true

  return false
}

export function useKeyboardInput(): void {
  const mode = useCalculatorStore((state) => state.mode)
  const appendToken = useCalculatorStore((state) => state.appendToken)
  const evaluate = useCalculatorStore((state) => state.evaluate)
  const backspace = useCalculatorStore((state) => state.backspace)
  const clearExpression = useCalculatorStore((state) => state.clearExpression)
  const setMode = useCalculatorStore((state) => state.setMode)

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (shouldIgnoreKeyboardEvent(event)) return

      const key = event.key

      if (key === 'Enter') {
        event.preventDefault()
        evaluate()
        return
      }

      if (key === 'Backspace') {
        event.preventDefault()
        backspace()
        return
      }

      if (key === 'Escape') {
        event.preventDefault()
        clearExpression()
        return
      }

      if (key === 'F1') {
        event.preventDefault()
        setMode('standard')
        return
      }

      if (key === 'F2') {
        event.preventDefault()
        setMode('scientific')
        return
      }

      if (key === 'F3') {
        event.preventDefault()
        setMode('programmer')
        return
      }

      if (key === 'F4') {
        event.preventDefault()
        setMode('graph')
        return
      }

      if (key === 'F5') {
        event.preventDefault()
        setMode('symbolic')
        return
      }

      const isNumeric = /^\d$/.test(key)
      if (isNumeric) {
        event.preventDefault()
        appendToken(key)
        return
      }

      if ('+-*/().,%'.includes(key)) {
        event.preventDefault()
        appendToken(key)
        return
      }

      if (mode === 'scientific' || mode === 'graph' || mode === 'symbolic') {
        if (key.toLowerCase() === 'p') {
          event.preventDefault()
          appendToken('pi')
          return
        }

        if (key.toLowerCase() === 'e') {
          event.preventDefault()
          appendToken('e')
          return
        }

        if (key === '^') {
          event.preventDefault()
          appendToken('^')
          return
        }
      }

      if (mode === 'programmer') {
        if ('ABCDEFabcdef'.includes(key)) {
          event.preventDefault()
          appendToken(key.toUpperCase())
          return
        }

        if (key === '&' || key === '|' || key === '~') {
          event.preventDefault()
          appendToken(key)
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [appendToken, backspace, clearExpression, evaluate, mode, setMode])
}


