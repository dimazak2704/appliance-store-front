import axios from 'axios';

export interface CategoryDto {
    id: number;
    nameEn: string;
    nameUa: string;
}

export interface ManufacturerDto {
    id: number;
    name: string;
}

const API_URL = 'http://localhost:8080/api';

export const getCategories = async (): Promise<CategoryDto[]> => {
    const response = await axios.get<CategoryDto[]>(`${API_URL}/dictionaries/categories`);
    return response.data;
};

export const getManufacturers = async (): Promise<ManufacturerDto[]> => {
    const response = await axios.get<ManufacturerDto[]>(`${API_URL}/dictionaries/manufacturers`);
    return response.data;
};
