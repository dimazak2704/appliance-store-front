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
    quantity: number;
}

export interface ApplianceParams {
    page?: number;
    size?: number;
    sort?: string;
    categoryId?: number;
    manufacturerId?: number;
    name?: string;
    minPrice?: number;
    maxPrice?: number;
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
