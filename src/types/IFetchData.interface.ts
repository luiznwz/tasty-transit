/* Interfaces from Shopify API */
export interface ProductVariant {
    id: number,
    product_id: number,
    title: string,
    price: string,
    sku: string,
    position: number,
    inventory_policy: string,
    compare_at_price: string | null,
    fulfillment_service: string,
    inventory_management: string | null,
    option1: string | null,
    option2: string | null,
    option3: string | null,
    created_at: string,
    updated_at: string,
    taxable: boolean,
    barcode: string | null,
    grams: number,
    image_id: number | null,
    weight: number,
    weight_unit: string,
    inventory_item_id: number,
    inventory_quantity: number,
    old_inventory_quantity: number,
    requires_shipping: boolean
}

export interface Product {
    id: number,
    title: string,
    body_html: string,
    vendor: string,
    product_type: string,
    created_at: string,
    handle: string,
    updated_at: string,
    published_at: string | null,
    template_suffix: string | null,
    status: string,
    published_scope: string,
    tags: string,
    admin_graphql_api_id: string,
    variants: Array<ProductVariant>,
    options: Array<{
        id: number,
        product_id: number,
        name: string,
        position: number,
        values: Array<string>
    }>,
    images: Array<{
        id: number,
        product_id: number,
        position: number,
        created_at: string,
        updated_at: string,
        alt: string | null,
        width: number,
        height: number,
        src: string,
        variant_ids: Array<number>
    }>,
    image: {
        id: number,
        product_id: number,
        position: number,
        created_at: string,
        updated_at: string,
        alt: string | null,
        width: number,
        height: number,
        src: string,
        variant_ids: Array<number>
    } | null
}

export interface CartProduct {
    id: number,
    properties: { [key: string]: string },
    quantity: number,
    variant_id: number,
    key: string,
    title: string,
    price: number,
    original_price: number,
    discounted_price: number,
    line_price: number,
    original_line_price: number,
    total_discount: number,
    discounts: Array<{
        amount: number,
        title: string,
        value: string,
        value_type: string
    }>,
    sku: string,
    grams: number,
    vendor: string,
    taxable: boolean,
    product_id: number,
    product_has_only_default_variant: boolean,
    gift_card: boolean,
    final_price: number,
    final_line_price: number,
    url: string,
    featured_image: {
        aspect_ratio: number,
        alt: string,
        height: number,
        url: string,
        width: number
    },
    image: string,
    handle: string,
    requires_shipping: boolean,
    product_type: string,
    product_title: string,
    product_description: string,
    variant_title: string,
    variant_options: Array<string>,
    options_with_values: Array<{
        name: string,
        value: string
    }>,
    line_level_discount_allocations: Array<{
        amount: number,
        discount_application: {
            type: string,
            value: string,
            value_type: string,
            allocation_method: string,
            target_selection: string,
            target_type: string,
            title: string
        }
    }>
}

export interface Cart {
    token: string,
    note: string | null,
    attributes: { [key: string]: string },
    original_total_price: number,
    total_price: number,
    total_discount: number,
    total_weight: number,
    item_count: number,
    items: Array<CartProduct>,
    requires_shipping: boolean,
    currency: string,
    items_subtotal_price: number,
    cart_level_discount_applications: Array<{
        type: string,
        key: string,
        title: string,
        description: string | null,
        value: string,
        created_at: string,
        value_type: string,
        allocation_method: string,
        target_selection: string,
        target_type: string
    }>,
    discount_codes: Array<{
        code: string,
        amount: string,
        type: string
    }>
}

export interface Collection {
    id: number,
    handle: string,
    title: string,
    updated_at: string,
    body_html: string,
    published_at: string,
    sort_order: string,
    template_suffix: string | null,
    products_count: number,
    collection_type: string,
    published_scope: string,
    admin_graphql_api_id: string,
    image?: {
        created_at: string,
        alt: string | null,
        width: number,
        height: number,
        src: string
    }
}

export interface IFetchData {
    getCart(): Promise<Cart>;
    getProducts(): Promise<Product[]>;
    getProduct(productHandle: string): Promise<Product>;
    getProductByUrl(url: string): Promise<Product>;
    getCollection(collectionHandle: string): Promise<Collection>;
    addToCart(productId: string, variantId: string, quantity?: number): Promise<Cart>;
}