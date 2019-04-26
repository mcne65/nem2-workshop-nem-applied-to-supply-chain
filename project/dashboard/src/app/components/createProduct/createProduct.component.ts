import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../services/product.service";
import {ProductModel} from "../../models/product.model";

@Component({
  selector: 'app-create-product',
  templateUrl: './createProduct.component.html'

})

export class CreateProductComponent implements OnInit {
  product : ProductModel;
  products: ProductModel[];
  errorMessage: string;

  constructor(private productService: ProductService) {
    this.errorMessage = '';
    this.products = [];
  }

  ngOnInit() {

    this.productService
      .getAllProducts()
      .subscribe(products => {
        this.products = products;
        this.clearError();
      }, err => {
        this.errorMessage = err.message;
      })

  }

  createProduct() {
    this.productService
      .createProduct()
      .subscribe(product => {
        this.product = product;
        this.products.push(this.product);
        this.clearError();
      }, err => {
        this.errorMessage = err.message;
      });
  }

  private clearError() {
    this.errorMessage = '';
  }
}
