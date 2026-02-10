import { create } from 'zustand';

interface ProductModalState {
    isOpen: boolean;
    selectedProductId: number | null;
    openModal: (productId: number) => void;
    closeModal: () => void;
}

export const useProductModal = create<ProductModalState>((set) => ({
    isOpen: false,
    selectedProductId: null,
    openModal: (productId) => set({ isOpen: true, selectedProductId: productId }),
    closeModal: () => set({ isOpen: false, selectedProductId: null }),
}));
