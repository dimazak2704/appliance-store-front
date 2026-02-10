import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- Categories ---

export interface CategoryDto {
    id: number;
    nameEn: string;
    nameUa: string;
}

export interface CategoryRequestDto {
    nameEn: string;
    nameUa: string;
}

export const getCategories = async (): Promise<CategoryDto[]> => {
    const response = await axios.get<CategoryDto[]>(`${API_URL}/categories`);
    return response.data;
};

export const createCategory = async (data: CategoryRequestDto): Promise<CategoryDto> => {
    const response = await axios.post<CategoryDto>(`${API_URL}/categories`, data, { headers: getAuthHeader() });
    return response.data;
};

export const updateCategory = async (id: number, data: CategoryRequestDto): Promise<CategoryDto> => {
    const response = await axios.put<CategoryDto>(`${API_URL}/categories/${id}`, data, { headers: getAuthHeader() });
    return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/categories/${id}`, { headers: getAuthHeader() });
};

// --- Manufacturers ---

export interface ManufacturerDto {
    id: number;
    name: string;
}

export interface ManufacturerRequestDto {
    name: string;
}

export const getManufacturers = async (): Promise<ManufacturerDto[]> => {
    const response = await axios.get<ManufacturerDto[]>(`${API_URL}/manufacturers`);
    return response.data;
};

export const createManufacturer = async (data: ManufacturerRequestDto): Promise<ManufacturerDto> => {
    const response = await axios.post<ManufacturerDto>(`${API_URL}/manufacturers`, data, { headers: getAuthHeader() });
    return response.data;
};

export const updateManufacturer = async (id: number, data: ManufacturerRequestDto): Promise<ManufacturerDto> => {
    const response = await axios.put<ManufacturerDto>(`${API_URL}/manufacturers/${id}`, data, { headers: getAuthHeader() });
    return response.data;
};

export const deleteManufacturer = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/manufacturers/${id}`, { headers: getAuthHeader() });
};
