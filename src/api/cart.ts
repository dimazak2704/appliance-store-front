import axios from 'axios';

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
}

export interface CheckoutRequest {
    address: string;
    phone: string;
}

const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Add item to cart
export const addToCart = async (applianceId: number): Promise<void> => {
    await axios.post(`${API_URL}/cart/add/${applianceId}`, {}, { headers: getAuthHeader() });
};

// Get cart details
export const getCart = async (): Promise<CartDto> => {
    const response = await axios.get<CartDto>(`${API_URL}/cart`, { headers: getAuthHeader() });
    return response.data;
};

// Checkout
export const checkout = async (data: CheckoutRequest): Promise<number> => {
    const response = await axios.post<number>(`${API_URL}/cart/checkout`, data, { headers: getAuthHeader() });
    return response.data;
};

// Remove item from cart
export const removeItem = async (applianceId: number): Promise<void> => {
    await axios.delete(`${API_URL}/cart/remove/${applianceId}`, { headers: getAuthHeader() });
};

// Update item quantity
export const updateQuantity = async (applianceId: number, quantity: number): Promise<void> => {
    await axios.put(`${API_URL}/cart/update/${applianceId}`, {}, {
        params: { quantity },
        headers: getAuthHeader()
    });
};
