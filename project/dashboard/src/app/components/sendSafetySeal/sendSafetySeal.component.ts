import {Component, OnInit} from '@angular/core';
import {ProductService} from '../../services/product.service';
import {SafetySealService} from '../../services/safetySeal.service';
import {ConstantsService} from '../../services/constants.service';
import {
  Account,
  Address,
  AggregateTransaction,
  Listener,
  NamespaceHttp,
  NetworkCurrencyMosaic,
  NetworkType,
  Transaction,
  TransactionHttp,
  TransactionStatusError,
} from 'nem2-sdk';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {isValidPrivateKey} from '../../validators/nem.validator';
import {ProductModel} from "../../models/product.model";
import {filter, mergeMap} from "rxjs/operators";

@Component({
  selector: 'app-send-safety-seal',
  templateUrl: './sendSafetySeal.component.html'
})
export class SendSafetySealComponent implements OnInit {

  transactionHttp: TransactionHttp;
  namespaceHttp: NamespaceHttp;
  listener: Listener;
  sendSafetySealForm: FormGroup;
  products: ProductModel[];
  confirmedTransactions: Transaction[];
  unconfirmedTransactions: Transaction[];
  statusErrors: TransactionStatusError[];
  aggregateBondedTransactions: AggregateTransaction[];

  constructor(private productService: ProductService,
              private safetySealService: SafetySealService,
              private formBuilder: FormBuilder) {

    this.transactionHttp = new TransactionHttp(ConstantsService.nodeURL);
    this.listener = new Listener(ConstantsService.listenerURL, WebSocket);
    this.namespaceHttp = new NamespaceHttp(ConstantsService.nodeURL);
    this.products = [];
    this.sendSafetySealForm = this.formBuilder.group({
      'privateKey': ['', [Validators.required, isValidPrivateKey]],
      'selectedProduct': ['', [Validators.required]]
    });
    this.confirmedTransactions = [];
    this.unconfirmedTransactions = [];
    this.statusErrors = [];
    this.aggregateBondedTransactions = [];
  }


  ngOnInit() {

    this.productService
      .getAllProducts()
      .subscribe(products => {
        this.products = products;
      }, err => {
        console.log(err);
      });

  }

  startListeners(address: Address) {

    this.listener
      .status(address)
      .subscribe(status => this.statusErrors.push(status),
        err => console.log(err));

    this.listener
      .confirmed(address)
      .subscribe(confirmedTransaction => this.confirmedTransactions.push(confirmedTransaction),
        err => console.log(err));

    this.listener
      .unconfirmedAdded(address)
      .subscribe(unconfirmedTransaction => this.unconfirmedTransactions.push(unconfirmedTransaction),
        err => console.log(err));

    this.listener
      .aggregateBondedAdded(address)
      .subscribe(aggregateTransaction => this.aggregateBondedTransactions.push(aggregateTransaction),
        err => console.log(err));
  }

  sendSafetySeal(form) {

    const operatorAccount = Account
      .createFromPrivateKey(form.privateKey, NetworkType.MIJIN_TEST);
    const productAddress = new ProductModel(form.selectedProduct).getDeterministicPublicAccount().address;

    const safetySealTransaction = this.safetySealService.createSafetySealTransaction(productAddress);
    const signedTransaction = operatorAccount.sign(safetySealTransaction!);

    this.listener.open().then(ignored => {

      this.startListeners(operatorAccount.address);

      this.transactionHttp
        .announce(signedTransaction)
        .subscribe(x => console.log(x),
          err => console.log(err));

    });

  }
}


