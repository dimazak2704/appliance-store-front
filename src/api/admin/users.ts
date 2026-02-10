import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin/users';

const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface AdminUserDto {
    id: number;
    name: string;
    email: string;
    role: "CLIENT" | "EMPLOYEE" | "ADMIN";
    card?: string;
    enabled: boolean;
}

export interface UserCreateRequest {
    name: string;
    email: string;
    password: string;
    role: string;
    card?: string;
}

export interface UserUpdateRequest {
    name: string;
    email: string;
    card?: string;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export const getAllUsers = async (
    page: number,
    size: number,
    search?: string,
    sort?: string[],
    role?: string,
    enabled?: boolean
): Promise<PageResponse<AdminUserDto>> => {
    const params: any = { page, size };
    if (search) params.search = search;
    if (sort) params.sort = sort;
    if (role && role !== 'ALL') params.role = role;
    if (enabled !== undefined) params.enabled = enabled;

    const response = await axios.get<PageResponse<AdminUserDto>>(API_URL, {
        headers: getAuthHeader(),
        params,
        paramsSerializer: {
            indexes: null
        }
    });
    return response.data;
};

export const createUser = async (data: UserCreateRequest): Promise<AdminUserDto> => {
    const response = await axios.post<AdminUserDto>(API_URL, data, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const updateUser = async (id: number, data: UserUpdateRequest): Promise<AdminUserDto> => {
    const response = await axios.put<AdminUserDto>(`${API_URL}/${id}`, data, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const updateUserRole = async (id: number, role: string): Promise<void> => {
    await axios.put(`${API_URL}/${id}/role`, { role }, {
        headers: getAuthHeader()
    });
};

export const toggleUserStatus = async (id: number, enabled: boolean): Promise<void> => {
    await axios.put(`${API_URL}/${id}/status`, null, {
        headers: getAuthHeader(),
        params: { enabled }
    });
};

export const deleteUser = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeader()
    });
};
