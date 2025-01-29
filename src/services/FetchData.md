# Documentação dos Métodos da Classe `FetchData`

## `getCart()`
Este método busca os dados do carrinho de compras da loja Shopify. Ele faz uma requisição para o endpoint `/cart.json` e retorna os dados do carrinho, incluindo informações sobre os produtos, preços, descontos e outras propriedades relevantes.

## `getProducts()`
Este método obtém uma lista de todos os produtos disponíveis na loja. Ele faz uma requisição para o endpoint `/products.json` e retorna uma lista de produtos com todas as suas propriedades, incluindo variantes e imagens.

## `getProductByUrl(url)`
Este método obtém informações detalhadas de um produto específico usando a URL do produto. Ele faz uma requisição para o endpoint `{url}.json` e retorna os detalhes do produto, incluindo variantes e imagens.

## `getCollection(collectionHandle)`
Este método obtém uma coleção de produtos específica usando o handle da coleção. Ele faz duas requisições: uma para obter os produtos da coleção (`/collections/{collectionHandle}/products.json`) e outra para obter os detalhes da coleção (`/collections/{collectionHandle}.json`). Retorna um objeto que inclui os detalhes da coleção e a lista de produtos nela contidos.

## `getProduct(productId)`
Este método obtém informações detalhadas de um produto específico usando o ID do produto. Ele faz uma requisição para o endpoint `/products/{productId}.json` e retorna os detalhes do produto, incluindo variantes e imagens.

## `addToCart(productId, variantId)`
Este método adiciona um produto ao carrinho de compras usando o ID do produto e o ID da variante. Ele faz uma requisição POST para o endpoint `/cart/add.js` com os dados do produto a ser adicionado. Após adicionar o produto ao carrinho, ele atualiza o estado do carrinho e retorna o carrinho atualizado.