import type { AppLanguageCode } from './languages'

export function isRussianUiLanguage(language: AppLanguageCode): boolean {
  return language.toLowerCase().startsWith('ru')
}

export function pickUiText(
  language: AppLanguageCode,
  english: string,
  russian: string,
): string {
  return isRussianUiLanguage(language) ? russian : english
}
