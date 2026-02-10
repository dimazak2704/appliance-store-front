import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, Filter } from 'lucide-react';

import { getAppliances } from '@/api/appliances';
import { getCategories, getManufacturers } from '@/api/dictionaries';
import { ProductCard } from '@/components/ProductCard';
import { useProductModal } from '@/store/productStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis
} from '@/components/ui/pagination';

// Mock Data


const SORT_OPTIONS = [
    { value: 'price,asc', labelEn: 'Price: Low to High', labelUa: 'Ціна: від найдешевшого' },
    { value: 'price,desc', labelEn: 'Price: High to Low', labelUa: 'Ціна: від найдорожчого' },
    { value: 'createdAt,desc', labelEn: 'Newest', labelUa: 'Новинки' },
];

const POWER_RANGES = [
    { id: 'p1', label: '0 - 100 W', min: 0, max: 100 },
    { id: 'p2', label: '100 - 300 W', min: 100, max: 300 },
    { id: 'p3', label: '300 - 1000 W', min: 300, max: 1000 },
    { id: 'p4', label: '1000+ W', min: 1000, max: 999999 }, // Simplified upper bound
];

const POWER_TYPES = [
    { id: 'AC220', label: 'AC 220V' },
    { id: 'AC110', label: 'AC 110V' },
    { id: 'ACCUMULATOR', label: 'Accumulator' },
];

export function CatalogPage() {
    const { i18n } = useTranslation();
    const isUa = i18n.language === 'ua';

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
    const [manufacturerIds, setManufacturerIds] = useState<number[]>([]);
    const [selectedPowerRanges, setSelectedPowerRanges] = useState<string[]>([]);
    const [selectedPowerTypes, setSelectedPowerTypes] = useState<string[]>([]);
    const [minPrice, setMinPrice] = useState(''); // String to handle empty input
    const [maxPrice, setMaxPrice] = useState('');
    const [appliedMinPrice, setAppliedMinPrice] = useState<number | undefined>(undefined);
    const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | undefined>(undefined);
    const openProductModal = useProductModal((state) => state.openModal);

    // Pagination & Sort State
    const [page, setPage] = useState(0);
    const [sort, setSort] = useState('createdAt,desc');
    const pageSize = 8;

    // Debounce Search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0); // Reset page on search change
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Reset page when filters change
    useEffect(() => {
        setPage(0);
    }, [categoryId, manufacturerIds, appliedMinPrice, appliedMaxPrice, sort, selectedPowerRanges, selectedPowerTypes]);

    // Calculate global min/max power based on selected ranges
    const getPowerBounds = () => {
        if (selectedPowerRanges.length === 0) return { min: undefined, max: undefined };

        const selectedRanges = POWER_RANGES.filter(r => selectedPowerRanges.includes(r.id));
        const min = Math.min(...selectedRanges.map(r => r.min));
        const max = Math.max(...selectedRanges.map(r => r.max));
        return { min, max };
    };

    const { min: minPower, max: maxPower } = getPowerBounds();

    // Fetch Data
    const { data: categories, isLoading: isCategoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    const { data: manufacturers, isLoading: isManufacturersLoading } = useQuery({
        queryKey: ['manufacturers'],
        queryFn: getManufacturers,
    });

    const { data, isLoading, isError } = useQuery({
        queryKey: ['appliances', page, pageSize, sort, categoryId, manufacturerIds, debouncedSearch, appliedMinPrice, appliedMaxPrice, minPower, maxPower, selectedPowerTypes],
        queryFn: () => getAppliances({
            page,
            size: pageSize,
            sort,
            categoryId,
            manufacturerIds: manufacturerIds.length > 0 ? manufacturerIds.join(',') : undefined,
            name: debouncedSearch || undefined,
            minPrice: appliedMinPrice,
            maxPrice: appliedMaxPrice,
            minPower,
            maxPower,
            powerTypes: selectedPowerTypes.length > 0 ? selectedPowerTypes.join(',') : undefined,
        }),
    });

    const handlePriceApply = () => {
        setAppliedMinPrice(minPrice ? Number(minPrice) : undefined);
        setAppliedMaxPrice(maxPrice ? Number(maxPrice) : undefined);
    };

    const handleReset = () => {
        setSearchTerm('');
        setCategoryId(undefined);
        setManufacturerIds([]);
        setSelectedPowerRanges([]);
        setSelectedPowerTypes([]);
        setMinPrice('');
        setMaxPrice('');
        setAppliedMinPrice(undefined);
        setAppliedMaxPrice(undefined);
        setSort('createdAt,desc');
        setPage(0);
    };

    const currentSortLabel = SORT_OPTIONS.find(o => o.value === sort)?.[isUa ? 'labelUa' : 'labelEn'];

    return (
        <div className="container mx-auto py-8 px-4 flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
                <div className="space-y-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold text-lg">{isUa ? 'Фільтри' : 'Filters'}</h2>
                        {(categoryId || manufacturerIds.length > 0 || selectedPowerRanges.length > 0 || selectedPowerTypes.length > 0 || appliedMinPrice || appliedMaxPrice || debouncedSearch) && (
                            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 px-2 text-red-500 hover:text-red-600">
                                {isUa ? 'Скинути' : 'Reset'}
                            </Button>
                        )}
                    </div>



                    {/* Categories */}
                    <div className="space-y-3 pb-4 border-b">
                        <label className="text-sm font-medium">{isUa ? 'Категорії' : 'Categories'}</label>
                        <div className="flex flex-col gap-1">
                            {isCategoriesLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-muted animate-pulse rounded" />)}
                                </div>
                            ) : (
                                categories?.map(cat => (
                                    <Button
                                        key={cat.id}
                                        variant={categoryId === cat.id ? "default" : "ghost"}
                                        className="justify-start h-8 px-2"
                                        onClick={() => setCategoryId(categoryId === cat.id ? undefined : cat.id)}
                                    >
                                        {isUa ? cat.nameUa : cat.nameEn}
                                    </Button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-3 pb-4 border-b">
                        <label className="text-sm font-medium">{isUa ? 'Ціна' : 'Price'}</label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder={isUa ? "Мін" : "Min"}
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                                className="h-8"
                            />
                            <span>-</span>
                            <Input
                                type="number"
                                placeholder={isUa ? "Макс" : "Max"}
                                value={maxPrice}
                                onChange={e => setMaxPrice(e.target.value)}
                                className="h-8"
                            />
                        </div>
                        <Button size="sm" variant="outline" className="w-full h-8" onClick={handlePriceApply}>
                            {isUa ? 'ОК' : 'OK'}
                        </Button>
                    </div>

                    {/* Power Range */}
                    <div className="space-y-3 pb-4 border-b">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">{isUa ? 'Потужність' : 'Power'}</label>
                            {selectedPowerRanges.length > 0 && <span className="text-xs text-muted-foreground">({selectedPowerRanges.length})</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                            {POWER_RANGES.map(range => (
                                <div key={range.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`power-${range.id}`}
                                        checked={selectedPowerRanges.includes(range.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedPowerRanges([...selectedPowerRanges, range.id]);
                                            } else {
                                                setSelectedPowerRanges(selectedPowerRanges.filter(id => id !== range.id));
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor={`power-${range.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {range.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Power Type */}
                    <div className="space-y-3 pb-4 border-b">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">{isUa ? 'Тип живлення' : 'Power Type'}</label>
                            {selectedPowerTypes.length > 0 && <span className="text-xs text-muted-foreground">({selectedPowerTypes.length})</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                            {POWER_TYPES.map(type => (
                                <div key={type.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`ptype-${type.id}`}
                                        checked={selectedPowerTypes.includes(type.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedPowerTypes([...selectedPowerTypes, type.id]);
                                            } else {
                                                setSelectedPowerTypes(selectedPowerTypes.filter(id => id !== type.id));
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor={`ptype-${type.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {type.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Manufacturers */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">{isUa ? 'Виробник' : 'Manufacturer'}</label>
                            {manufacturerIds.length > 0 && <span className="text-xs text-muted-foreground">({manufacturerIds.length})</span>}
                        </div>
                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                            {isManufacturersLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map(i => <div key={i} className="h-4 bg-muted animate-pulse rounded w-3/4" />)}
                                </div>
                            ) : (
                                manufacturers?.map(man => (
                                    <div key={man.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`man-${man.id}`}
                                            checked={manufacturerIds.includes(man.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setManufacturerIds([...manufacturerIds, man.id]);
                                                } else {
                                                    setManufacturerIds(manufacturerIds.filter(id => id !== man.id));
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={`man-${man.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {man.name}
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 space-y-6">
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-lg shadow-sm border">
                    <div className="flex flex-1 items-center gap-4 w-full">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={isUa ? 'Назва товару...' : 'Product name...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <div className="text-sm text-muted-foreground whitespace-nowrap hidden md:block">
                            {isUa ? `Знайдено: ${data?.totalElements || 0}` : `Found: ${data?.totalElements || 0}`}
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-[200px] justify-between">
                                {currentSortLabel}
                                <Filter className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {SORT_OPTIONS.map(opt => (
                                <DropdownMenuItem key={opt.value} onClick={() => setSort(opt.value)}>
                                    {isUa ? opt.labelUa : opt.labelEn}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Loading / Error states */}
                {isLoading && <div className="text-center py-10">{isUa ? 'Завантаження...' : 'Loading...'}</div>}
                {isError && <div className="text-center py-10 text-red-500">{isUa ? 'Помилка завантаження товарів' : 'Error loading products'}</div>}

                {/* Product Grid */}
                {!isLoading && !isError && (
                    <>
                        {data?.content.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground">
                                {isUa ? 'Товарів не знайдено' : 'No products found'}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {data?.content.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onClick={() => openProductModal(product.id)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {data && data.totalPages > 1 && (
                            <Pagination className="mt-8">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage(p => Math.max(0, p - 1))}
                                            // disabled={page === 0} // Custom Pagination component might need 'disabled' prop support or handled via onClick check
                                            className={page === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                            label={isUa ? "Назад" : "Previous"}
                                        />
                                    </PaginationItem>

                                    {/* Simple pagination logic: Show first, last, current, and surrounding */}
                                    {[...Array(data.totalPages)].map((_, i) => {
                                        // Show first, last, current, current-1, current+1
                                        if (i === 0 || i === data.totalPages - 1 || (i >= page - 1 && i <= page + 1)) {
                                            return (
                                                <PaginationItem key={i}>
                                                    <PaginationLink
                                                        isActive={page === i}
                                                        onClick={() => setPage(i)}
                                                    >
                                                        {i + 1}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        }
                                        // Show ellipsis
                                        if (i === page - 2 || i === page + 2) {
                                            return <PaginationItem key={i}><PaginationEllipsis /></PaginationItem>;
                                        }
                                        return null;
                                    })}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                                            className={page === data.totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                            label={isUa ? "Далі" : "Next"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </>
                )}
            </main>

        </div>
    );
}
