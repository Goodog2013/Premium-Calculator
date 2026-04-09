import { ConverterPluginDefinition } from '../types/calculator'

export const builtInConverterPlugins: ConverterPluginDefinition[] = [
  {
    id: 'fuel-economy',
    name: 'Fuel Economy',
    description: 'Convert between L/100km, MPG and km/L.',
    category: 'Automotive',
    baseUnitKey: 'l_per_100km',
    units: [
      {
        key: 'l_per_100km',
        label: 'Liters per 100 km',
        symbol: 'L/100km',
        toBaseFormula: 'value',
        fromBaseFormula: 'value',
      },
      {
        key: 'mpg_us',
        label: 'Miles per gallon (US)',
        symbol: 'mpg(US)',
        toBaseFormula: '235.214583 / value',
        fromBaseFormula: '235.214583 / value',
      },
      {
        key: 'mpg_uk',
        label: 'Miles per gallon (UK)',
        symbol: 'mpg(UK)',
        toBaseFormula: '282.480936 / value',
        fromBaseFormula: '282.480936 / value',
      },
      {
        key: 'km_per_liter',
        label: 'Kilometers per liter',
        symbol: 'km/L',
        toBaseFormula: '100 / value',
        fromBaseFormula: '100 / value',
      },
    ],
  },
  {
    id: 'typography-scale',
    name: 'Typography Scale',
    description: 'Convert between px, pt, rem and pica (root size 16px).',
    category: 'Design',
    baseUnitKey: 'px',
    units: [
      {
        key: 'px',
        label: 'Pixels',
        symbol: 'px',
        toBaseFormula: 'value',
        fromBaseFormula: 'value',
      },
      {
        key: 'pt',
        label: 'Points',
        symbol: 'pt',
        toBaseFormula: 'value * 96 / 72',
        fromBaseFormula: 'value * 72 / 96',
      },
      {
        key: 'rem',
        label: 'Root em',
        symbol: 'rem',
        toBaseFormula: 'value * 16',
        fromBaseFormula: 'value / 16',
      },
      {
        key: 'pica',
        label: 'Pica',
        symbol: 'pc',
        toBaseFormula: 'value * 16',
        fromBaseFormula: 'value / 16',
      },
    ],
  },
]

