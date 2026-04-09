const LANGUAGE_OPTIONS = [
  { code: 'en-US', englishName: 'English', nativeName: 'English' },
  { code: 'zh-CN', englishName: 'Mandarin Chinese', nativeName: '中文 (简体)' },
  { code: 'hi-IN', englishName: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'es-ES', englishName: 'Spanish', nativeName: 'Español' },
  { code: 'fr-FR', englishName: 'French', nativeName: 'Français' },
  { code: 'ar-SA', englishName: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'bn-BD', englishName: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pt-BR', englishName: 'Portuguese', nativeName: 'Português' },
  { code: 'ru-RU', englishName: 'Russian', nativeName: 'Русский' },
  { code: 'ur-PK', englishName: 'Urdu', nativeName: 'اردو', rtl: true },
  { code: 'id-ID', englishName: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'de-DE', englishName: 'German', nativeName: 'Deutsch' },
  { code: 'ja-JP', englishName: 'Japanese', nativeName: '日本語' },
  { code: 'sw-KE', englishName: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'mr-IN', englishName: 'Marathi', nativeName: 'मराठी' },
  { code: 'te-IN', englishName: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'tr-TR', englishName: 'Turkish', nativeName: 'Türkçe' },
  { code: 'ta-IN', englishName: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ko-KR', englishName: 'Korean', nativeName: '한국어' },
  { code: 'vi-VN', englishName: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'it-IT', englishName: 'Italian', nativeName: 'Italiano' },
  { code: 'th-TH', englishName: 'Thai', nativeName: 'ไทย' },
  { code: 'gu-IN', englishName: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'fa-IR', englishName: 'Persian', nativeName: 'فارسی', rtl: true },
  { code: 'pl-PL', englishName: 'Polish', nativeName: 'Polski' },
  { code: 'uk-UA', englishName: 'Ukrainian', nativeName: 'Українська' },
  { code: 'kn-IN', englishName: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml-IN', englishName: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'or-IN', englishName: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa-IN', englishName: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ro-RO', englishName: 'Romanian', nativeName: 'Română' },
  { code: 'nl-NL', englishName: 'Dutch', nativeName: 'Nederlands' },
  { code: 'ha-NG', englishName: 'Hausa', nativeName: 'Hausa' },
  { code: 'my-MM', englishName: 'Burmese', nativeName: 'မြန်မာ' },
  { code: 'fil-PH', englishName: 'Filipino', nativeName: 'Filipino' },
  { code: 'yo-NG', englishName: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'am-ET', englishName: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'cs-CZ', englishName: 'Czech', nativeName: 'Čeština' },
  { code: 'el-GR', englishName: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'hu-HU', englishName: 'Hungarian', nativeName: 'Magyar' },
  { code: 'sv-SE', englishName: 'Swedish', nativeName: 'Svenska' },
  { code: 'da-DK', englishName: 'Danish', nativeName: 'Dansk' },
  { code: 'fi-FI', englishName: 'Finnish', nativeName: 'Suomi' },
  { code: 'nb-NO', englishName: 'Norwegian', nativeName: 'Norsk' },
  { code: 'sk-SK', englishName: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'bg-BG', englishName: 'Bulgarian', nativeName: 'Български' },
  { code: 'sr-RS', englishName: 'Serbian', nativeName: 'Српски' },
  { code: 'hr-HR', englishName: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'jv-ID', englishName: 'Javanese', nativeName: 'Basa Jawa' },
  { code: 'ms-MY', englishName: 'Malay', nativeName: 'Bahasa Melayu' },
] as const

export type AppLanguageCode = (typeof LANGUAGE_OPTIONS)[number]['code']

export interface LanguageOption {
  code: AppLanguageCode
  englishName: string
  nativeName: string
  rtl?: true
}

export const languageOptions: readonly LanguageOption[] = LANGUAGE_OPTIONS

export const defaultLanguage: AppLanguageCode = 'en-US'

const languageOptionMap = new Map<AppLanguageCode, LanguageOption>(
  languageOptions.map((option) => [option.code, option] as const),
)

export function isSupportedLanguage(value: string): value is AppLanguageCode {
  return languageOptionMap.has(value as AppLanguageCode)
}

export function resolveLanguage(value: string | null | undefined): AppLanguageCode {
  if (!value) return defaultLanguage
  return isSupportedLanguage(value) ? value : defaultLanguage
}

export function getLanguageOption(code: AppLanguageCode): LanguageOption {
  return languageOptionMap.get(code) ?? languageOptionMap.get(defaultLanguage)!
}

export function isRtlLanguage(code: AppLanguageCode): boolean {
  return Boolean(getLanguageOption(code).rtl)
}
