import { AxiosError } from 'axios'
import { UseFormSetError, FieldValues, Path } from 'react-hook-form'
import { toast } from 'sonner'
import i18n from '@/lib/i18n'

export interface ApiErrorResponse {
  status: number
  error: string
  message: string
  details?: Record<string, string>
}

export interface ErrorHandlerOptions<T extends FieldValues> {
  setError?: UseFormSetError<T>
  setGlobalError?: (message: string) => void
  fallbackMessage?: string
}

// Хелпер для перекладу ключів з бекенду
const tryTranslate = (text?: string) => {
  if (!text) return undefined;
  return i18n.exists(text) ? i18n.t(text) : text;
};

export function extractApiError(error: unknown): ApiErrorResponse | null {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data

    if (data.details && typeof data.details === 'object' && !Array.isArray(data.details)) {
      return {
        status: error.response.status,
        error: data.error || 'Validation Error',
        message: Object.values(data.details).join('\n'),
        details: data.details
      }
    }

    return {
      status: error.response.status,
      error: data.error || 'Error',
      message: data.message || data.error || 'Unknown error',
      details: data.details || data.errors,
    }
  }
  return null
}

export function handleApiError<T extends FieldValues>(
  error: unknown,
  options: ErrorHandlerOptions<T> = {}
): void {
  // 1. ГОЛОВНА ПЕРЕВІРКА: Якщо інтерсептор вже показав тост, і ми не хочемо
  // ставити помилку в форму (setError) або в стейт (setGlobalError), то виходимо.
  if ((error as any).isToastShown && !options.setGlobalError && !options.setError) {
    return;
  }

  const apiError = extractApiError(error)

  const showError = (message: string) => {
    // Якщо інтерсептор вже показав тост, ми НЕ показуємо його знову тут,
    // хіба що ми хочемо записати його в setGlobalError (кастомний стейт)
    if ((error as any).isToastShown && !options.setGlobalError) return;

    if (options.setGlobalError) {
      options.setGlobalError(message)
    } else {
      toast.error(message, { id: message }) // id для дедуплікації
    }
  }

  if (!apiError) {
    showError(
      options.fallbackMessage
        ? i18n.t(options.fallbackMessage)
        : i18n.t('errors.somethingWentWrong', 'Something went wrong.')
    )
    return
  }

  const { status, message, details } = apiError
  // Пробуємо перекласти меседж з бекенду
  const translatedBackendMsg = tryTranslate(message);

  switch (status) {
    case 400:
      // Валідація полів форми
      if (details && options.setError) {
        Object.entries(details).forEach(([field, errorMessage]) => {
          // Перекладаємо конкретну помилку поля
          const translatedError = tryTranslate(errorMessage) || errorMessage;

          options.setError!(field as Path<T>, {
            type: 'server',
            message: translatedError,
          })
        })
        // Якщо ми розставили помилки по полях, тост не потрібен (якщо інтерсептор його не показав)
      } else {
        showError(translatedBackendMsg || i18n.t('errors.validationError', 'Validation error'))
      }
      break

    case 401:
      showError(i18n.t('errors.unauthorized', 'Invalid email or password'))
      break

    case 403:
      showError(
        translatedBackendMsg || i18n.t('errors.forbidden', 'Access denied')
      )
      break

    case 404:
      showError(translatedBackendMsg || i18n.t('errors.notFound', 'Resource not found'))
      break;

    case 409:
      showError(translatedBackendMsg || i18n.t('errors.conflict', 'Resource already exists'))
      break

    case 500:
    default:
      showError(
        translatedBackendMsg || i18n.t('errors.serverError', 'Something went wrong.')
      )
      break
  }
}