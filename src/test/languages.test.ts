import { describe, expect, it } from 'vitest'
import {
  defaultLanguage,
  isSupportedLanguage,
  languageOptions,
  resolveLanguage,
} from '../i18n/languages'

describe('language catalog', () => {
  it('contains exactly 50 languages', () => {
    expect(languageOptions).toHaveLength(50)
  })

  it('contains unique language codes', () => {
    const codeSet = new Set(languageOptions.map((language) => language.code))
    expect(codeSet.size).toBe(languageOptions.length)
  })

  it('resolves unsupported language to default', () => {
    expect(resolveLanguage('xx-XX')).toBe(defaultLanguage)
    expect(resolveLanguage(undefined)).toBe(defaultLanguage)
  })

  it('recognizes supported language codes', () => {
    expect(isSupportedLanguage('ru-RU')).toBe(true)
    expect(isSupportedLanguage('xx-XX')).toBe(false)
  })
})
