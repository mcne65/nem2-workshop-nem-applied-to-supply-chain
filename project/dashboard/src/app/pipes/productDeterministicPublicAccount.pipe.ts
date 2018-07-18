import {Pipe, PipeTransform} from '@angular/core';
import {PublicAccount} from "nem2-sdk";
import {ProductService} from "../services/product.service";


@Pipe({name: 'productDeterministicPublicAccount'})
export class ProductDeterministicPublicAccountPipe implements PipeTransform {

  constructor(private productService: ProductService) {

  }

  transform(id: string): PublicAccount {

    return this.productService.getDeterministicPublicAccount(id);
  }
}
