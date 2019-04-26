import {Component, OnInit} from '@angular/core';
import {ProductService} from '../../services/product.service';
import {AccountInfo, Listener, MosaicAmountView, Transaction, TransactionHttp} from 'nem2-sdk';
import {ConstantsService} from '../../services/constants.service';
import {ActivatedRoute} from '@angular/router';
import {ProductModel} from "../../models/product.model";

@Component({
  selector: 'app-product-detail',
  templateUrl: './productDetail.component.html',

})

export class ProductDetailComponent implements OnInit {
  transactionHttp: TransactionHttp;
  product: ProductModel;
  transactions: Transaction[];
  mosaics: MosaicAmountView[];
  accountInfo: AccountInfo | null;
  listener: Listener;

  constructor(private productService: ProductService, private activeRoute: ActivatedRoute) {
    this.transactionHttp = new TransactionHttp(ConstantsService.nodeURL);
    this.product = new ProductModel(this.activeRoute.snapshot.params['id']);
    this.accountInfo = null;
    this.transactions = [];
    this.mosaics = [];
    this.listener = new Listener(ConstantsService.listenerURL, WebSocket);
  }

  ngOnInit() {
    this.getProductInfo();
    this.listener.open().then(() => {
      this.listener
        .confirmed(this.product.getDeterministicPublicAccount().address)
        .subscribe(ignored => {
          this.getProductInfo();
        }, err => console.error(err));
    });
  }

  private getProductInfo() {
    this.productService
      .getProductInfo(this.product.getDeterministicPublicAccount())
      .subscribe(
        accountInfo => {
          this.accountInfo = accountInfo;
          console.log(accountInfo);
        },
        err => {
          console.log(err);
        });

    this.productService
      .getProductMosaics(this.product.getDeterministicPublicAccount())
      .subscribe(
        mosaics => {
          this.mosaics = mosaics;
          console.log(mosaics);
        },
        err => {
          console.log(err);
        });

    this.productService
      .getProductTransactions(this.product.getDeterministicPublicAccount())
      .subscribe(
        transactions => {
          console.log(transactions);

          this.transactions = transactions;
        },
        err => console.log(err));
  }
}
