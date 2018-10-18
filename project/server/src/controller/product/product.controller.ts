import {ExpressSignature} from "../IRoute";
import {ProductService} from "../../domain/product/product.service";
import {map, mergeMap, toArray} from "rxjs/operators";
import {Account, NetworkType} from "nem2-sdk";

export let createProduct: ExpressSignature = (request, response, next) => {
    const productService = new ProductService();

    // Save product in the database and return product created
    return productService.createProduct()
        .subscribe((product) => response.status(200).send(product.toMessage()),
            (err) => response.status(400).send(err));
};

export let getProducts: ExpressSignature = (request, response, next) => {
    const productService = new ProductService();

    return productService.getProducts()
        .pipe(
            mergeMap(_ => _),
            map((product) => product.toMessage()),
            toArray(),
        )
        .subscribe((products) => {
                return response.status(200).send(products);
            },
            (err) => response.status(400).send(err));
};
