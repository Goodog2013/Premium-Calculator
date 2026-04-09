import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { listAllConverterPlugins } from '../providers/converterPlugins/pluginService'
import { useCalculatorStore } from '../state/calculatorStore'
import { useConverterPluginStore } from '../state/converterPluginStore'
import { useSymbolicStore } from '../state/symbolicStore'

function resetStore(): void {
  useCalculatorStore.setState({
    mode: 'standard',
    sidePanelTab: 'history',
    theme: 'system',
    language: 'en-US',
    angleMode: 'deg',
    programmerBase: 'dec',
    isAdvancedCollapsed: false,
    expression: '',
    result: '0',
    preview: '',
    error: null,
    history: [],
    favorites: [],
    memoryValue: null,
    unitConverter: {
      category: 'length',
      fromUnit: 'meter',
      toUnit: 'kilometer',
      inputValue: '1',
      outputValue: '0.001',
      error: null,
    },
    currencyConverter: {
      base: 'USD',
      quote: 'EUR',
      amount: '100',
      outputValue: '91',
      isLoading: false,
      providerName: 'Open ER API',
      lastUpdatedAt: null,
      error: null,
    },
    graph: {
      expression: 'sin(x)',
      xMin: -10,
      xMax: 10,
      points: [],
      error: null,
    },
  })

  useSymbolicStore.setState({
    solveExpression: 'x^2 - 5*x + 6 = 0',
    solveVariable: 'x',
    solveResult: 'x = 2, 3',
    factorExpression: 'x^3 - 1',
    factorResult: '(x-1)*(x^2+x+1)',
    simplifyExpression: '(x^2 - 1)/(x - 1)',
    simplifyResult: 'x+1',
    error: null,
  })

  const builtIns = listAllConverterPlugins([])
  const fallback = builtIns[0]
  const from = fallback.baseUnitKey
  const to = fallback.units.find((unit) => unit.key !== from)?.key ?? from

  useConverterPluginStore.setState({
    userPlugins: [],
    pluginConverter: {
      pluginId: fallback.id,
      fromUnit: from,
      toUnit: to,
      inputValue: '1',
      outputValue: '',
      error: null,
    },
    pluginDraft: '',
    pluginManagerError: null,
  })
}

describe('calculator ui flow', () => {
  beforeEach(() => {
    localStorage.clear()
    resetStore()
  })

  it('calculates expression using keypad', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '2' }))
    await user.click(screen.getByRole('button', { name: '+' }))
    await user.click(screen.getByRole('button', { name: '2' }))
    await user.click(screen.getAllByRole('button', { name: /evaluate/i })[0])

    await waitFor(() => {
      expect(useCalculatorStore.getState().result).toBe('4')
    })
  })

  it('switches mode and calculates from keyboard', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Scientific/ }))
    expect(useCalculatorStore.getState().mode).toBe('scientific')

    await user.keyboard('9/3{Enter}')

    await waitFor(() => {
      expect(useCalculatorStore.getState().result).toBe('3')
    })
  })

  it('changes app language from settings', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /settings/i }))
    const languageSelect = await screen.findByLabelText(/language/i)
    await user.selectOptions(languageSelect, 'ru-RU')

    expect(useCalculatorStore.getState().language).toBe('ru-RU')
  })

  it('solves equation in symbolic mode', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /symbolic/i }))

    const equationInput = await screen.findByLabelText(/equation/i)
    await user.clear(equationInput)
    await user.type(equationInput, 'x^2-5*x+6=0')

    const variableInput = screen.getByLabelText(/variable/i)
    await user.clear(variableInput)
    await user.type(variableInput, 'x')

    await user.click(screen.getByRole('button', { name: /^solve$/i }))

    await waitFor(() => {
      expect(useSymbolicStore.getState().solveResult).toContain('2')
      expect(useSymbolicStore.getState().solveResult).toContain('3')
    })
  })
})

