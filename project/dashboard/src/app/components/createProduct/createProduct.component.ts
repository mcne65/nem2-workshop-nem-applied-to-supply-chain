import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../services/product.service";

@Component({
  selector: 'app-create-product',
  templateUrl: './createProduct.component.html'

})

export class CreateProductComponent implements OnInit {

  product: Object | null;
  products: Object[];
  errorMessage: string;

  constructor(private productService: ProductService) {
    this.product = null;
    this.products = [];
    this.errorMessage = '';
  }

  ngOnInit() {

    this.productService
      .getAllProducts()
      .subscribe(response => {
        this.products = <Object[]> response;
        this.clearError();
      }, err => {
        this.errorMessage = err.message;
      })

  }

  createProduct() {
    this.productService
      .createProduct()
      .subscribe(response => {
        this.product = response;
        this.products.push(this.product);
        this.clearError();
      }, err => {
        this.errorMessage = err.message;
      });
  }

  private clearError(){
    this.errorMessage = '';
  }
}
