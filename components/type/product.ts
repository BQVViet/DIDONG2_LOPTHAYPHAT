// type.ts

// Product chung cho tất cả các component
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

// Props cho Home component
export interface HomeProps {
  onSearch: () => void;
  onCategoryClick: () => void;
  onNewArrivalClick: (product: Product) => void;
  newArrivals: Product[];
}

// Props cho Categories component
export interface CategoriesProps {
  products: Product[];
  onBack: () => void;
  onProductClick: (product: Product) => void;
}

// Category item (nếu bạn muốn mở rộng)
export interface Category {
  id: string;
  name: string;
  icon: string;
  count?: number; // số lượng sản phẩm trong category (tùy chọn)
}
