import axios from 'axios';

export interface ApplianceDto {
    id: number;
    nameEn: string;
    nameUa: string;
    descriptionEn: string;
    descriptionUa: string;
    price: number;
    imageUrl: string;
    categoryNameEn: string;
    categoryNameUa: string;
    manufacturerName: string;
    model: string;
    power: number;
    powerType: string;
    active: boolean;
    categoryId: number;
    manufacturerId: number;
    quantity: number;
    stockQuantity: number;
    createdAt: string;
}

export interface ApplianceParams {
    page?: number;
    size?: number;
    sort?: string | string[];
    categoryId?: number;
    manufacturerIds?: string; // Comma separated IDs
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    minPower?: number;
    maxPower?: number;
    powerTypes?: string; // Comma separated AC220,AC110,ACCUMULATOR
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

const API_URL = 'http://localhost:8080/api';

export const getAppliances = async (params: ApplianceParams): Promise<PageResponse<ApplianceDto>> => {
    const response = await axios.get<PageResponse<ApplianceDto>>(`${API_URL}/appliances`, {
        params,
    });
    return response.data;
};

export const getApplianceById = async (id: number): Promise<ApplianceDto> => {
    const response = await axios.get<ApplianceDto>(`${API_URL}/appliances/${id}`);
    return response.data;
};
