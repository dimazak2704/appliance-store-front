import axios from 'axios';

const API_URL = 'http://localhost:8080/api/client';

const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// DTO Interfaces
export interface ClientProfileDto {
    name: string;
    email: string;
    card?: string;
    role: string;
}

export interface UpdateProfileRequest {
    name: string;
    card?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export enum OrderStatus {
    NEW = 'NEW',
    CONFIRMED = 'CONFIRMED',
    SHIPPED = 'SHIPPED',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED'
}

export interface OrderHistoryItemDto {
    productId: number;
    productNameEn: string;
    productNameUa: string;
    imageUrl: string;
    quantity: number;
    priceAtPurchase: number;
    rowTotal: number;
}

export interface OrderHistoryDto {
    id: number;
    date: string; // ISO Date string
    totalAmount: number;
    deliveryCost: number;
    status: OrderStatus;
    deliveryType: string;
    deliveryAddress: string;
    items: OrderHistoryItemDto[];
}

// API Functions

export const getProfile = async (): Promise<ClientProfileDto> => {
    const response = await axios.get<ClientProfileDto>(`${API_URL}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const updateProfile = async (data: UpdateProfileRequest): Promise<ClientProfileDto> => {
    const response = await axios.put<ClientProfileDto>(`${API_URL}`, data, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
    await axios.put(`${API_URL}/password`, data, {
        headers: getAuthHeader()
    });
};

export const getMyOrders = async (status?: string | null): Promise<OrderHistoryDto[]> => {
    const params = status && status !== 'ALL' ? { status } : {};
    const response = await axios.get<OrderHistoryDto[]>(`${API_URL}/orders`, {
        headers: getAuthHeader(),
        params
    });
    return response.data;
};

export const cancelOrder = async (id: number): Promise<void> => {
    await axios.patch(`${API_URL}/orders/${id}/cancel`, {}, {
        headers: getAuthHeader()
    });
};
