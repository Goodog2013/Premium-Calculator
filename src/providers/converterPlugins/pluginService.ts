import { builtInConverterPlugins } from '../../converters/pluginCatalog'
import { sanitizeConverterPluginDefinition } from '../../converters/pluginConverterEngine'
import { ConverterPluginDefinition } from '../../types/calculator'

export interface ConverterPluginProvider {
  id: string
  displayName: string
  getPlugins: () => ConverterPluginDefinition[]
}

export function createBuiltInConverterProvider(): ConverterPluginProvider {
  return {
    id: 'built-in',
    displayName: 'Built-in converters',
    getPlugins: () => builtInConverterPlugins,
  }
}

export function createUserConverterProvider(
  plugins: ConverterPluginDefinition[],
): ConverterPluginProvider {
  return {
    id: 'user',
    displayName: 'User plugins',
    getPlugins: () => plugins,
  }
}

export class ConverterPluginService {
  constructor(private readonly providers: ConverterPluginProvider[]) {}

  listPlugins(): ConverterPluginDefinition[] {
    const merged: ConverterPluginDefinition[] = []
    const uniqueIds = new Set<string>()

    for (const provider of this.providers) {
      const source = provider.getPlugins()

      for (const rawPlugin of source) {
        const plugin = sanitizeConverterPluginDefinition(rawPlugin)

        if (uniqueIds.has(plugin.id)) {
          continue
        }

        uniqueIds.add(plugin.id)
        merged.push(plugin)
      }
    }

    return merged
  }
}

export function listAllConverterPlugins(
  userPlugins: ConverterPluginDefinition[],
): ConverterPluginDefinition[] {
  const service = new ConverterPluginService([
    createBuiltInConverterProvider(),
    createUserConverterProvider(userPlugins),
  ])

  return service.listPlugins()
}

