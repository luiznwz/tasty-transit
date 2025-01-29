import { Product, Collection } from '../../types/IFetchData.interface';

export class ProductService {
    async getProducts(): Promise<Product[]> {
        const response = await fetch('/products.json');
        const data = await response.json();
        return data.products as Product[];
    }

    async getProductByUrl(url: string): Promise<Product> {
        const response = await fetch(`${url}.json`);
        const data = await response.json();
        return data.product as Product;
    }

    async getProduct(productHandle: string): Promise<Product> {
        const response = await fetch(`/products/${productHandle}.json`);
        const data = await response.json();
        return data.product as Product;
    }

    async getCollection(collectionHandle: string): Promise<Collection> {
        const response = await fetch(`/collections/${collectionHandle}.json`);
        const data = await response.json();
        return data.collection as Collection;
    }
}