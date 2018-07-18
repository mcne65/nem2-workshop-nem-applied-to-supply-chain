import * as express from "express";
import {IRoute} from "../IRoute";
import {createProduct, getProducts} from "./product.controller";

export default class ProductRouter implements IRoute {

    public URL: string = "/products";

    public static create(): IRoute {
        return new ProductRouter();
    }

    public decorate(app: express.Application) {
        app.route(this.URL).post(createProduct);
        app.route(this.URL).get(getProducts);
    }
}