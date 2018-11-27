import {Component, OnInit} from '@angular/core';
import {ProductService} from '../../services/product.service';
import {AccountInfo, Address, Listener, MosaicAmountView, PublicAccount, Transaction, TransactionHttp} from 'nem2-sdk';
import {ConstantsService} from '../../services/constants.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-product-detail',
  templateUrl: './productDetail.component.html',

})

export class ProductDetailComponent implements OnInit {
  transactionHttp: TransactionHttp;
  publicAccount: PublicAccount;
  id: string;
  transactions: Transaction[];
  mosaics: MosaicAmountView[];
  accountInfo: AccountInfo | null;
  listener: Listener;

  constructor(private productService: ProductService, private activeRoute: ActivatedRoute) {
    this.transactionHttp = new TransactionHttp(ConstantsService.nodeURL);
    this.id = this.activeRoute.snapshot.params['id'];
    this.publicAccount = this.productService.getDeterministicPublicAccount(this.id);
    this.accountInfo = null;
    this.transactions = [];
    this.mosaics = [];
    this.listener = new Listener(ConstantsService.listenerURL, WebSocket);
  }

  ngOnInit() {
    this.getProductInfo();

    this.listener
      .confirmed(this.publicAccount.address)
      .subscribe(ignored => {
        this.getProductInfo();
      }, err => console.error(err));
  }

  private getProductInfo() {
    this.productService
      .getProductInfo(this.publicAccount)
      .subscribe(
        accountInfo => {
          this.accountInfo = accountInfo;
          console.log(accountInfo);
        },
        err => {
          console.log(err);
        });

    this.productService
      .getProductMosaics(this.publicAccount)
      .subscribe(
        mosaics => {
          this.mosaics = mosaics;
          console.log(mosaics);
        },
        err => {
          console.log(err);
        });

    this.productService
      .getProductTransactions(this.publicAccount)
      .subscribe(
        transactions => {
          console.log(transactions);

          this.transactions = transactions;
        },
        err => console.log(err));
  }
}
