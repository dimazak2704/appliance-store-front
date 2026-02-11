import api from '@/api/axios';

const API_URL = 'http://localhost:8080/api';

export interface CartItemDto {
    id: number;
    applianceId: number;
    nameEn: string;
    nameUa: string;
    price: number;
    quantity: number;
    rowTotal: number;
    imageUrl: string;
}

export interface CartDto {
    items: CartItemDto[];
    totalPrice: number;
    totalQuantity: number;
    amountLeftForFreeShipping: number;
    isFreeShipping: boolean;
}

export type DeliveryType = 'SELF_PICKUP' | 'COURIER' | 'POST';

export interface CheckoutRequest {
    address?: string;
    phone: string;
    deliveryType: DeliveryType;
}

const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Add item to cart
export const addToCart = async (applianceId: number): Promise<void> => {
    await api.post(`${API_URL}/cart/add/${applianceId}`, {}, { headers: getAuthHeader() });
};

// Get cart details
export const getCart = async (): Promise<CartDto> => {
    const response = await api.get<CartDto>(`${API_URL}/cart`, { headers: getAuthHeader() });
    return response.data;
};

// Checkout
export const checkout = async (data: CheckoutRequest): Promise<number> => {
    const response = await api.post<number>(`${API_URL}/cart/checkout`, data, { headers: getAuthHeader() });
    return response.data;
};

// Remove item from cart
export const removeItem = async (applianceId: number): Promise<void> => {
    await api.delete(`${API_URL}/cart/remove/${applianceId}`, { headers: getAuthHeader() });
};

// Update item quantity
export const updateQuantity = async (applianceId: number, quantity: number): Promise<void> => {
    await api.put(`${API_URL}/cart/update/${applianceId}`, {}, {
        params: { quantity },
        headers: getAuthHeader()
    });
};
