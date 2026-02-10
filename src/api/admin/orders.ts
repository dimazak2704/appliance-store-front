import axios from 'axios';
import { OrderHistoryDto } from '@/api/client';

const API_URL = 'http://localhost:8080/api/admin/orders';

const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface AdminOrderDto extends OrderHistoryDto {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
}

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface OrderParams {
    page?: number;
    size?: number;
    sort?: string[];
    search?: string;
    status?: string;
    deliveryType?: string;
}

export const getAdminOrders = async (params: OrderParams = {}): Promise<Page<AdminOrderDto>> => {
    const { page = 0, size = 10, sort, search, status, deliveryType } = params;

    const queryParams: any = { page, size };

    // Передаємо масив як є
    if (sort) queryParams.sort = sort;

    if (search) queryParams.search = search;
    if (status && status !== 'ALL') queryParams.status = status;
    if (deliveryType && deliveryType !== 'ALL') queryParams.deliveryType = deliveryType;

    const response = await axios.get<Page<AdminOrderDto>>(`${API_URL}`, {
        headers: getAuthHeader(),
        params: queryParams,
        // ДОДАЙ ЦЕЙ БЛОК:
        paramsSerializer: (params) => {
            const searchParams = new URLSearchParams();
            Object.keys(params).forEach(key => {
                const value = params[key];
                if (Array.isArray(value)) {
                    // Якщо це масив (sort), додаємо кожен елемент окремо без дужок []
                    value.forEach(val => searchParams.append(key, val));
                } else if (value !== undefined && value !== null) {
                    searchParams.append(key, value.toString());
                }
            });
            return searchParams.toString();
        }
    });
    return response.data;
};

export const updateOrderStatus = async (id: number, newStatus: string): Promise<void> => {
    await axios.patch(`${API_URL}/${id}/status`, null, {
        headers: getAuthHeader(),
        params: { newStatus }
    });
};
