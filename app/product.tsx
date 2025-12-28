import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

// Giả định kiểu Product được định nghĩa tại nơi khác
// Tương đương với interface Product của bạn
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  originalPrice?: number;
  rating?: number;
  reviews: number;
  inStock: boolean;
  description?: string;
  badge?: string;
  sizes?: string[];
  colors?: string[];
}

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: boolean;
}

// Icon Components (thay thế cho Lucide React)
const ArrowLeft = (props: any) => <Ionicons name="arrow-back" size={24} color="#374151" {...props} />;
const HeartIcon = (props: any) => <Ionicons name={props.fill ? "heart" : "heart-outline"} size={24} color="#EF4444" {...props} />;
const ShareIcon = (props: any) => <Feather name="share-2" size={24} color="#374151" {...props} />;
const StarIcon = (props: any) => <Ionicons name="star" size={16} color="#F59E0B" {...props} />;
const MinusIcon = (props: any) => <Feather name="minus" size={20} color="#374151" {...props} />;
const PlusIcon = (props: any) => <Feather name="plus" size={20} color="#374151" {...props} />;
const ShoppingCartIcon = (props: any) => <Feather name="shopping-cart" size={20} color="white" {...props} />;


export default function ProductDetail({
  product,
  onBack,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  // Dùng toán tử `?.[0]` để an toàn truy cập phần tử đầu tiên
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedSize, selectedColor);
    // Show success feedback
  };

  const totalPrice = product.price * quantity;

  // Sử dụng styles.container để đảm bảo flex: 1 và màu nền
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <ArrowLeft />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <ShareIcon />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onToggleWishlist(product)}
            style={styles.headerButton}
          >
            <HeartIcon fill={isInWishlist} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {product.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.badge}</Text>
            </View>
          )}
        </View>

        <View style={styles.contentPadding}>
          {/* Product Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.flex1}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.currentPrice}>${product.price.toFixed(2)}</Text>
                {product.originalPrice && (
                  <Text style={styles.originalPrice}>
                    ${product.originalPrice.toFixed(2)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.ratingRow}>
                <StarIcon />
                <Text style={styles.ratingText}>{product.rating?.toFixed(1) || 'N/A'}</Text>
              </View>
              <Text style={styles.divider}>|</Text>
              <Text style={styles.reviewsText}>{product.reviews} reviews</Text>
              <Text style={styles.divider}>|</Text>
              <Text style={product.inStock ? styles.inStock : styles.outOfStock}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <View style={styles.selectionSection}>
              <Text style={styles.selectionLabel}>
                Color: <Text style={styles.selectionValue}>{selectedColor}</Text>
              </Text>
              <View style={styles.optionsRow}>
                {product.colors.map(color => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.optionButton,
                      selectedColor === color
                        ? styles.optionSelected
                        : styles.optionDefault,
                    ]}
                  >
                    <Text
                      style={
                        selectedColor === color
                          ? styles.optionTextSelected
                          : styles.optionTextDefault
                      }
                    >
                      {color}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <View style={styles.selectionSection}>
              <Text style={styles.selectionLabel}>
                Size: <Text style={styles.selectionValue}>{selectedSize}</Text>
              </Text>
              <View style={styles.optionsRowWrap}>
                {product.sizes.map(size => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    style={[
                      styles.optionButton,
                      selectedSize === size
                        ? styles.optionSelected
                        : styles.optionDefault,
                    ]}
                  >
                    <Text
                      style={
                        selectedSize === size
                          ? styles.optionTextSelected
                          : styles.optionTextDefault
                      }
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.quantityButton}
                disabled={quantity <= 1}
              >
                <MinusIcon color={quantity <= 1 ? '#9CA3AF' : '#374151'} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={styles.quantityButton}
              >
                <PlusIcon />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabBar}>
            <View style={styles.tabButtonContainer}>
              <TouchableOpacity
                onPress={() => setActiveTab('description')}
                style={styles.tabButton}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'description' && styles.tabTextActive,
                  ]}
                >
                  Description
                </Text>
                {activeTab === 'description' && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('reviews')}
                style={styles.tabButton}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'reviews' && styles.tabTextActive,
                  ]}
                >
                  Reviews ({product.reviews})
                </Text>
                {activeTab === 'reviews' && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Tab Content */}
          {activeTab === 'description' ? (
            <View style={styles.tabContent}>
              <Text style={styles.descriptionText}>
                {product.description || 'No description available.'}
              </Text>
            </View>
          ) : (
            <View style={styles.reviewsContent}>
              {[1, 2, 3].map(i => (
                <View key={i} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.avatar}></View>
                    <View>
                      <Text style={styles.reviewUser}>User {i}</Text>
                      <View style={styles.ratingRowSmall}>
                        {[...Array(5)].map((_, j) => (
                          <StarIcon key={j} size={12} color="#F59E0B" />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>
                    Great product! Highly recommended.
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <View style={styles.totalPriceContainer}>
            <Text style={styles.totalPriceLabel}>Total Price</Text>
            <Text style={styles.totalPriceValue}>${totalPrice.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={!product.inStock}
            style={[
              styles.addToCartButton,
              !product.inStock && styles.addToCartButtonDisabled,
            ]}
          >
            <ShoppingCartIcon />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // General Containers
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flex: 1,
  },
  contentPadding: {
    paddingHorizontal: 16,
  },
  flex1: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
    // Platform specific padding for safe areas
    paddingTop: Platform.OS === 'android' ? 40 : 16, 
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },

  // Image & Badge
  imageContainer: {
    aspectRatio: 1,
    backgroundColor: '#F3F4F6',
    padding: 24,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  badge: {
    position: 'absolute',
    top: 32,
    left: 32,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Product Info
  infoSection: {
    marginBottom: 16,
    paddingTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  productCategory: {
    color: '#6B7280',
    fontSize: 14,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    color: '#2563EB',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    color: '#9CA3AF',
  },
  reviewsText: {
    color: '#6B7280',
    fontSize: 14,
  },
  inStock: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 14,
  },
  outOfStock: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },

  // Selection (Color/Size)
  selectionSection: {
    marginBottom: 16,
  },
  selectionLabel: {
    color: '#4B5563',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  selectionValue: {
    fontWeight: '400',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionsRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
  },
  optionDefault: {
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  optionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  optionTextDefault: {
    color: '#4B5563',
  },
  optionTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },

  // Quantity
  quantitySection: {
    marginBottom: 24,
  },
  quantityLabel: {
    color: '#4B5563',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  quantityText: {
    width: 48,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },

  // Tabs
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 16,
  },
  tabButtonContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  tabButton: {
    paddingBottom: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 2,
    backgroundColor: '#2563EB',
  },

  // Tab Content
  tabContent: {
    paddingBottom: 4, // Padding cuối của tab content
  },
  descriptionText: {
    color: '#4B5563',
    fontSize: 15,
    lineHeight: 22,
  },
  reviewsContent: {
    gap: 16,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  ratingRowSmall: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  reviewText: {
    fontSize: 14,
    color: '#4B5563',
  },

  // Bottom Bar (Fixed)
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
    // Shadow nhẹ
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 10,
  },
  bottomBarContent: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  totalPriceContainer: {
    flex: 1,
  },
  totalPriceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  totalPriceValue: {
    color: '#2563EB',
    fontSize: 20,
    fontWeight: '700',
  },
  addToCartButton: {
    flex: 1.5, // Cho nút lớn hơn
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});