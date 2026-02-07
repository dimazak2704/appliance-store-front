import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, Filter } from 'lucide-react';

import { getAppliances } from '@/api/appliances';
import { ProductCard } from '@/components/ProductCard';
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
const CATEGORIES = [
    { id: 1, nameEn: 'Laptops', nameUa: 'Ноутбуки' },
    { id: 2, nameEn: 'Phones', nameUa: 'Телефони' },
    { id: 3, nameEn: 'Tablets', nameUa: 'Планшети' },
    { id: 4, nameEn: 'TVs', nameUa: 'Телевізори' },
    { id: 5, nameEn: 'Fridges', nameUa: 'Холодильники' },
    { id: 6, nameEn: 'Washing Machines', nameUa: 'Пральні машини' },
];

const MANUFACTURERS = [
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Samsung' },
    { id: 3, name: 'LG' },
    { id: 4, name: 'Sony' },
    { id: 5, name: 'Bosch' },
    { id: 6, name: 'Asus' },
    { id: 7, name: 'Dell' },
];

const SORT_OPTIONS = [
    { value: 'price,asc', labelEn: 'Price: Low to High', labelUa: 'Ціна: від найдешевшого' },
    { value: 'price,desc', labelEn: 'Price: High to Low', labelUa: 'Ціна: від найдорожчого' },
    { value: 'id,desc', labelEn: 'Newest', labelUa: 'Новинки' }, // Assuming id desc implies newest
];

export function CatalogPage() {
    const { i18n } = useTranslation();
    const isUa = i18n.language === 'ua';

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
    const [manufacturerId, setManufacturerId] = useState<number | undefined>(undefined);
    const [minPrice, setMinPrice] = useState(''); // String to handle empty input
    const [maxPrice, setMaxPrice] = useState('');
    const [appliedMinPrice, setAppliedMinPrice] = useState<number | undefined>(undefined);
    const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | undefined>(undefined);

    // Pagination & Sort State
    const [page, setPage] = useState(0);
    const [sort, setSort] = useState('id,desc');
    const pageSize = 12;

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
    }, [categoryId, manufacturerId, appliedMinPrice, appliedMaxPrice, sort]);

    // Fetch Data
    const { data, isLoading, isError } = useQuery({
        queryKey: ['appliances', page, pageSize, sort, categoryId, manufacturerId, debouncedSearch, appliedMinPrice, appliedMaxPrice],
        queryFn: () => getAppliances({
            page,
            size: pageSize,
            sort,
            categoryId,
            manufacturerId,
            name: debouncedSearch || undefined,
            minPrice: appliedMinPrice,
            maxPrice: appliedMaxPrice,
        }),
    });

    const handlePriceApply = () => {
        setAppliedMinPrice(minPrice ? Number(minPrice) : undefined);
        setAppliedMaxPrice(maxPrice ? Number(maxPrice) : undefined);
    };

    const handleReset = () => {
        setSearchTerm('');
        setCategoryId(undefined);
        setManufacturerId(undefined);
        setMinPrice('');
        setMaxPrice('');
        setAppliedMinPrice(undefined);
        setAppliedMaxPrice(undefined);
        setSort('id,desc');
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
                        {(categoryId || manufacturerId || appliedMinPrice || appliedMaxPrice || debouncedSearch) && (
                            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 px-2 text-red-500 hover:text-red-600">
                                {isUa ? 'Скинути' : 'Reset'}
                            </Button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{isUa ? 'Пошук' : 'Search'}</label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={isUa ? 'Назва товару...' : 'Product name...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{isUa ? 'Категорії' : 'Categories'}</label>
                        <div className="flex flex-col gap-1">
                            {CATEGORIES.map(cat => (
                                <Button
                                    key={cat.id}
                                    variant={categoryId === cat.id ? "default" : "ghost"}
                                    className="justify-start h-8 px-2"
                                    onClick={() => setCategoryId(categoryId === cat.id ? undefined : cat.id)}
                                >
                                    {isUa ? cat.nameUa : cat.nameEn}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{isUa ? 'Ціна' : 'Price'}</label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                                className="h-8"
                            />
                            <span>-</span>
                            <Input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={e => setMaxPrice(e.target.value)}
                                className="h-8"
                            />
                        </div>
                        <Button size="sm" variant="outline" className="w-full h-8" onClick={handlePriceApply}>
                            OK
                        </Button>
                    </div>

                    {/* Manufacturers */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{isUa ? 'Виробник' : 'Manufacturer'}</label>
                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                            {MANUFACTURERS.map(man => (
                                <div key={man.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`man-${man.id}`}
                                        checked={manufacturerId === man.id}
                                        onCheckedChange={(checked) => setManufacturerId(checked ? man.id : undefined)} // Single select roughly
                                    />
                                    <label
                                        htmlFor={`man-${man.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {man.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 space-y-6">
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-lg shadow-sm border">
                    <div className="text-sm text-muted-foreground">
                        {isUa ? `Знайдено товарів: ${data?.totalElements || 0}` : `Total items found: ${data?.totalElements || 0}`}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-[200px] justify-between">
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
                {isLoading && <div className="text-center py-10">Loading...</div>}
                {isError && <div className="text-center py-10 text-red-500">Error loading products</div>}

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
                                    <ProductCard key={product.id} product={product} />
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
