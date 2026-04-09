import { UnitCategoryDefinition } from '../types/calculator'

export const unitCatalog: UnitCategoryDefinition[] = [
  {
    key: 'length',
    label: 'Length',
    units: [
      { key: 'meter', label: 'Meter', symbol: 'm', factor: 1 },
      { key: 'kilometer', label: 'Kilometer', symbol: 'km', factor: 1000 },
      { key: 'centimeter', label: 'Centimeter', symbol: 'cm', factor: 0.01 },
      { key: 'millimeter', label: 'Millimeter', symbol: 'mm', factor: 0.001 },
      { key: 'inch', label: 'Inch', symbol: 'in', factor: 0.0254 },
      { key: 'foot', label: 'Foot', symbol: 'ft', factor: 0.3048 },
      { key: 'yard', label: 'Yard', symbol: 'yd', factor: 0.9144 },
      { key: 'mile', label: 'Mile', symbol: 'mi', factor: 1609.344 },
    ],
  },
  {
    key: 'mass',
    label: 'Mass',
    units: [
      { key: 'kilogram', label: 'Kilogram', symbol: 'kg', factor: 1 },
      { key: 'gram', label: 'Gram', symbol: 'g', factor: 0.001 },
      { key: 'milligram', label: 'Milligram', symbol: 'mg', factor: 0.000001 },
      { key: 'pound', label: 'Pound', symbol: 'lb', factor: 0.45359237 },
      { key: 'ounce', label: 'Ounce', symbol: 'oz', factor: 0.028349523125 },
      { key: 'tonne', label: 'Tonne', symbol: 't', factor: 1000 },
    ],
  },
  {
    key: 'temperature',
    label: 'Temperature',
    units: [
      { key: 'celsius', label: 'Celsius', symbol: '°C', factor: 1, offset: 273.15 },
      {
        key: 'fahrenheit',
        label: 'Fahrenheit',
        symbol: '°F',
        factor: 5 / 9,
        offset: 459.67,
      },
      { key: 'kelvin', label: 'Kelvin', symbol: 'K', factor: 1, offset: 0 },
    ],
  },
  {
    key: 'area',
    label: 'Area',
    units: [
      { key: 'square_meter', label: 'Square meter', symbol: 'm²', factor: 1 },
      { key: 'square_kilometer', label: 'Square kilometer', symbol: 'km²', factor: 1_000_000 },
      { key: 'square_foot', label: 'Square foot', symbol: 'ft²', factor: 0.09290304 },
      { key: 'square_yard', label: 'Square yard', symbol: 'yd²', factor: 0.83612736 },
      { key: 'acre', label: 'Acre', symbol: 'ac', factor: 4046.8564224 },
      { key: 'hectare', label: 'Hectare', symbol: 'ha', factor: 10000 },
    ],
  },
  {
    key: 'volume',
    label: 'Volume',
    units: [
      { key: 'liter', label: 'Liter', symbol: 'L', factor: 1 },
      { key: 'milliliter', label: 'Milliliter', symbol: 'mL', factor: 0.001 },
      { key: 'cubic_meter', label: 'Cubic meter', symbol: 'm³', factor: 1000 },
      { key: 'gallon_us', label: 'Gallon (US)', symbol: 'gal', factor: 3.785411784 },
      { key: 'pint_us', label: 'Pint (US)', symbol: 'pt', factor: 0.473176473 },
      { key: 'cup_us', label: 'Cup (US)', symbol: 'cup', factor: 0.2365882365 },
    ],
  },
  {
    key: 'speed',
    label: 'Speed',
    units: [
      { key: 'meter_per_second', label: 'Meter per second', symbol: 'm/s', factor: 1 },
      { key: 'kilometer_per_hour', label: 'Kilometer per hour', symbol: 'km/h', factor: 0.2777777778 },
      { key: 'mile_per_hour', label: 'Mile per hour', symbol: 'mph', factor: 0.44704 },
      { key: 'knot', label: 'Knot', symbol: 'kn', factor: 0.5144444444 },
    ],
  },
  {
    key: 'time',
    label: 'Time',
    units: [
      { key: 'second', label: 'Second', symbol: 's', factor: 1 },
      { key: 'millisecond', label: 'Millisecond', symbol: 'ms', factor: 0.001 },
      { key: 'minute', label: 'Minute', symbol: 'min', factor: 60 },
      { key: 'hour', label: 'Hour', symbol: 'h', factor: 3600 },
      { key: 'day', label: 'Day', symbol: 'd', factor: 86400 },
      { key: 'week', label: 'Week', symbol: 'wk', factor: 604800 },
    ],
  },
  {
    key: 'data',
    label: 'Data',
    units: [
      { key: 'byte', label: 'Byte', symbol: 'B', factor: 1 },
      { key: 'kilobyte', label: 'Kilobyte', symbol: 'KB', factor: 1024 },
      { key: 'megabyte', label: 'Megabyte', symbol: 'MB', factor: 1024 ** 2 },
      { key: 'gigabyte', label: 'Gigabyte', symbol: 'GB', factor: 1024 ** 3 },
      { key: 'terabyte', label: 'Terabyte', symbol: 'TB', factor: 1024 ** 4 },
      { key: 'bit', label: 'Bit', symbol: 'b', factor: 0.125 },
    ],
  },
]
