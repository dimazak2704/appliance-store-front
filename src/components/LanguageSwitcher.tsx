import React from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const languages = [
  { code: 'en', label: 'EN', flag: 'EN' },
  { code: 'ua', label: 'UA', flag: 'UA' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language === 'ua' ? 'ua' : 'en'
  const isUA = currentLang === 'ua'

  const handleToggle = () => {
    const newLang = isUA ? 'en' : 'ua'
    i18n.changeLanguage(newLang)
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "relative inline-flex h-9 w-20 shrink-0 items-center rounded-full border-2 border-border/50 bg-muted/50",
        "transition-all duration-300 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "hover:border-primary/50 hover:bg-muted",
        "active:scale-95"
      )}
      aria-label="Toggle language"
    >
      {/* Sliding indicator - фіксована ширина та правильне переміщення */}
      <span
        className={cn(
          "absolute left-0.5 top-0.5 flex h-7 w-9 items-center justify-center rounded-full",
          "bg-primary text-primary-foreground shadow-md",
          "transition-transform duration-300 ease-in-out",
          isUA && "translate-x-[2.5rem]"
        )}
      >
        <span className="text-base leading-none">
          {isUA ? languages[1].flag : languages[0].flag}
        </span>
      </span>

      {/* Labels - фіксовані позиції з однаковою шириною */}
      <div className="flex w-full items-center justify-between px-2 pointer-events-none">
        <span className={cn(
          "text-xs font-semibold transition-all duration-300 flex-1 text-center",
          !isUA ? "opacity-100 text-foreground" : "opacity-30 text-muted-foreground"
        )}>
          EN
        </span>
        <span className={cn(
          "text-xs font-semibold transition-all duration-300 flex-1 text-center",
          isUA ? "opacity-100 text-foreground" : "opacity-30 text-muted-foreground"
        )}>
          UA
        </span>
      </div>
    </button>
  )
}
