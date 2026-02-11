import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';

const api = axios.create();

// Допоміжна функція для перекладу, якщо бек кидає ключ
const tryTranslate = (text: string) => {
    return i18n.exists(text) ? i18n.t(text) : text;
};

api.interceptors.request.use((config) => {
    // 1. Get token
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Set Language Header
    const currentLang = i18n.language || 'uk';
    config.headers['Accept-Language'] = currentLang;

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<any>) => {
        // Маркуємо помилку, щоб не показувати тост двічі в компонентах
        (error as any).isToastShown = false;

        if (error.response?.data) {
            const data = error.response.data;

            // 1. Пріоритет 1: Деталі валідації (Spring Boot)
            // Показуємо, тільки якщо це НЕ масив (бо якщо масив, це можуть бути інші помилки)
            if (data.details && typeof data.details === 'object' && !Array.isArray(data.details)) {
                // Беремо значення, перекладаємо їх і з'єднуємо
                const detailMessages = Object.values(data.details)
                    .map((msg: any) => tryTranslate(msg))
                    .join('\n');

                if (detailMessages) {
                    toast.error(detailMessages, { id: 'validation-error' }); // id запобігає дублікатам
                    (error as any).isToastShown = true;
                    return Promise.reject(error);
                }
            }

            // 2. Пріоритет 2: Старий формат errors
            if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
                const errorMessages = Object.values(data.errors)
                    .map((msg: any) => tryTranslate(msg))
                    .join('\n');

                if (errorMessages) {
                    toast.error(errorMessages, { id: 'validation-error' });
                    (error as any).isToastShown = true;
                    return Promise.reject(error);
                }
            }

            // 3. Пріоритет 3: Звичайний message або error
            const message = data.message || data.error;
            if (message) {
                const toastMessage = tryTranslate(message);
                // Ігноруємо "Validation Failed", бо це неінформативно, якщо не було деталей вище
                if (toastMessage !== 'Validation Failed' && toastMessage !== 'Validation failed') {
                    toast.error(toastMessage, { id: 'generic-error' });
                    (error as any).isToastShown = true;
                }
                return Promise.reject(error);
            }
        }

        // 4. Пріоритет 4: Фолбек (Network Error або 500 без тіла)
        // Показуємо тільки якщо статус не 401/403 (їх часто обробляють окремо, але тут покажемо)
        if (!error.response) {
            const fallbackMsg = i18n.t('errors.networkError', 'Network error. Please check your connection.');
            toast.error(fallbackMsg, { id: 'network-error' });
            (error as any).isToastShown = true;
        } else {
            const fallbackMsg = i18n.t('errors.somethingWentWrong', 'Something went wrong. Please try again later.');
            toast.error(fallbackMsg, { id: 'unknown-error' });
            (error as any).isToastShown = true;
        }

        return Promise.reject(error);
    }
);

export default api;