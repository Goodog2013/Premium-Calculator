import { describe, expect, it } from 'vitest'
import {
  convertWithPlugin,
  parseConverterPluginJson,
  sanitizeConverterPluginDefinition,
} from '../converters/pluginConverterEngine'
import { listAllConverterPlugins } from '../providers/converterPlugins/pluginService'

describe('plugin converter engine', () => {
  it('converts values using built-in plugin', () => {
    const plugins = listAllConverterPlugins([])
    const fuel = plugins.find((plugin) => plugin.id === 'fuel-economy')

    expect(fuel).toBeDefined()
    const converted = convertWithPlugin(30, fuel!, 'mpg_us', 'l_per_100km')
    expect(converted).toBeCloseTo(7.8404, 3)
  })

  it('parses and sanitizes plugin JSON', () => {
    const parsed = parseConverterPluginJson(`{
      "id": "coffee-ratio",
      "name": "Coffee Ratio",
      "description": "Convert brew mass units",
      "category": "Cooking",
      "baseUnitKey": "grams",
      "units": [
        {
          "key": "grams",
          "label": "Grams",
          "symbol": "g",
          "toBaseFormula": "value",
          "fromBaseFormula": "value"
        },
        {
          "key": "ounces",
          "label": "Ounces",
          "symbol": "oz",
          "toBaseFormula": "value * 28.349523125",
          "fromBaseFormula": "value / 28.349523125"
        }
      ]
    }`)

    const converted = convertWithPlugin(1, parsed, 'grams', 'ounces')
    expect(converted).toBeCloseTo(0.03527396, 5)
  })

  it('rejects malformed plugin definitions', () => {
    expect(() =>
      sanitizeConverterPluginDefinition({
        id: 'INVALID ID',
        name: 'Broken',
        description: '',
        category: 'Broken',
        baseUnitKey: 'a',
        units: [
          {
            key: 'a',
            label: 'A',
            symbol: 'a',
            toBaseFormula: 'value',
            fromBaseFormula: 'value',
          },
          {
            key: 'b',
            label: 'B',
            symbol: 'b',
            toBaseFormula: 'value +',
            fromBaseFormula: 'value',
          },
        ],
      }),
    ).toThrow()
  })
})


