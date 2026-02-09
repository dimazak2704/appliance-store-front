import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- Interfaces ---

export interface ProfileDto {
    name: string;
    email: string; // Read-only usually
    card?: string;
    role?: string;
}

export interface UpdateProfileDto {
    name: string;
    card?: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface OrderItemDto {
    id: number;
    productId: number;
    productNameEn: string;
    productNameUa: string;
    imageUrl?: string;
    quantity: number;
    priceAtPurchase: number;
    rowTotal: number;
}

export interface OrderHistoryDto {
    id: number;
    date: string; // ISO date string
    totalAmount: number;
    deliveryCost: number;
    status: 'NEW' | 'CONFIRMED' | 'SHIPPED' | 'CANCELED';
    deliveryType: 'SELF_PICKUP' | 'COURIER' | 'POST';
    deliveryAddress?: string;
    items: OrderItemDto[];
}

// --- API Functions ---

// Get current user profile
export const getProfile = async (): Promise<ProfileDto> => {
    const response = await axios.get<ProfileDto>(`${API_URL}/profile`, { headers: getAuthHeader() });
    return response.data;
};

// Update user profile
export const updateProfile = async (data: UpdateProfileDto): Promise<ProfileDto> => {
    const response = await axios.put<ProfileDto>(`${API_URL}/profile`, data, { headers: getAuthHeader() });
    return response.data;
};

// Change password
export const changePassword = async (data: ChangePasswordDto): Promise<void> => {
    await axios.put(`${API_URL}/profile/password`, data, { headers: getAuthHeader() });
};

// Get my orders with optional status filter
export const getMyOrders = async (status?: string): Promise<OrderHistoryDto[]> => {
    const params = status && status !== 'ALL' ? { status } : {};
    const response = await axios.get<OrderHistoryDto[]>(`${API_URL}/profile/orders`, {
        headers: getAuthHeader(),
        params
    });
    return response.data;
};
