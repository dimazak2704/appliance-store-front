import { AxiosError } from 'axios'
import { UseFormSetError, FieldValues, Path } from 'react-hook-form'

export interface ApiErrorResponse {
  status: number
  error: string
  message: string
  details?: Record<string, string>
}

export interface ErrorHandlerOptions<T extends FieldValues> {
  setError?: UseFormSetError<T>
  setGlobalError?: (message: string) => void
}

/**
 * Extracts the API error response from an Axios error
 */
export function extractApiError(error: unknown): ApiErrorResponse | null {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as ApiErrorResponse
    return {
      status: data.status || error.response.status,
      error: data.error || 'Error',
      message: data.message || 'An error occurred',
      details: data.details,
    }
  }
  return null
}

/**
 * Handles API errors according to the backend error contract
 */
export function handleApiError<T extends FieldValues>(
  error: unknown,
  options: ErrorHandlerOptions<T>
): void {
  const apiError = extractApiError(error)

  if (!apiError) {
    // Unknown error format
    options.setGlobalError?.(
      'Something went wrong. Please try again later.'
    )
    return
  }

  const { status, message, details } = apiError

  switch (status) {
    case 400:
      // Validation errors - map to form fields
      if (details && options.setError) {
        Object.entries(details).forEach(([field, errorMessage]) => {
          options.setError(field as Path<T>, {
            type: 'server',
            message: errorMessage,
          })
        })
      } else {
        options.setGlobalError?.(message)
      }
      break

    case 401:
      // Unauthorized
      options.setGlobalError?.('Invalid email or password')
      break

    case 403:
      // Forbidden / Disabled
      options.setGlobalError?.(
        message || 'Account is disabled. Please check your email'
      )
      break

    case 409:
      // Conflict
      options.setGlobalError?.(message || 'User already exists')
      break

    case 500:
    default:
      // Internal server error or unknown
      options.setGlobalError?.(
        message || 'Something went wrong. Please try again later.'
      )
      break
  }
}

