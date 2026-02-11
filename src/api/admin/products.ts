import api from '@/api/axios';
import { ApplianceDto } from '@/api/appliances';

const API_URL = 'http://localhost:8080/api/admin/appliances';

const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Request DTO matches backend expectation
export interface ApplianceRequestDto {
    nameEn: string;
    nameUa: string;
    descriptionEn: string;
    descriptionUa: string;
    price: number;
    stockQuantity: number;
    categoryId: number;
    manufacturerId: number;
    model: string;
    power: number;
    powerType: string;
}

export const createProduct = async (data: ApplianceRequestDto): Promise<ApplianceDto> => {
    const response = await api.post<ApplianceDto>(`${API_URL}`, data, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const updateProduct = async (id: number, data: ApplianceRequestDto): Promise<ApplianceDto> => {
    const response = await api.put<ApplianceDto>(`${API_URL}/${id}`, data, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
    await api.delete(`${API_URL}/${id}`, {
        headers: getAuthHeader()
    });
};

export const uploadProductImage = async (id: number, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    await api.post(`${API_URL}/${id}/image`, formData, {
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data',
        },
    });
};
