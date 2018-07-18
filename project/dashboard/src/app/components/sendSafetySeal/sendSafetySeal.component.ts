import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../services/product.service";
import {SafetySealService} from "../../services/safetySeal.service";
import {ConstantsService} from "../../services/constants.service";
import {
  Account,
  Address,
  AggregateTransaction,
  Listener,
  NetworkType,
  PublicAccount,
  Transaction,
  TransactionHttp,
  TransactionStatusError,
  TransactionType
} from "nem2-sdk";
import {Asset} from "nem2-asset-identifier";

@Component({
  selector: 'app-send-safety-seal',
  templateUrl: './sendSafetySeal.component.html'
})
export class SendSafetySealComponent implements OnInit {

  transactionHttp: TransactionHttp;
  products: Object[];
  selectedProduct: string;
  privateKey: string;
  listener: Listener;
  confirmedTransactions: Transaction[];
  unconfirmedTransactions: Transaction[];
  statusErrors: TransactionStatusError[];
  aggregateBondedTransactions: AggregateTransaction[];
  successMessage: string;
  errorMessage: string;

  constructor(private productService: ProductService, private safetySealService: SafetySealService) {
    this.transactionHttp = new TransactionHttp(ConstantsService.nodeURL);
    this.products = [];
    this.selectedProduct = '';
    this.privateKey = '';
    this.listener = new Listener(ConstantsService.listenerURL, WebSocket);
    this.confirmedTransactions = [];
    this.unconfirmedTransactions = [];
    this.statusErrors = [];
    this.aggregateBondedTransactions = [];
    this.errorMessage = '';
    this.successMessage = '';
  }


  ngOnInit() {

    this.productService
      .getAllProducts()
      .subscribe(response => {
        this.products = <Object[]> response;
      }, err => {
        this.errorMessage = err.message;
      });

  }

  validPrivateKey() {
    try {
      Account.createFromPrivateKey(this.privateKey, NetworkType.MIJIN_TEST);
      return true;
    }
    catch (error) {
      return false;
    }
  }

  startListeners(address: Address) {

    this.listener
      .confirmed(address)
      .subscribe(confirmedTransaction => this.confirmedTransactions.push(confirmedTransaction),
        err => {
          this.errorMessage = err.message;
        });

    this.listener
      .unconfirmedAdded(address)
      .subscribe(unconfirmedTransaction => this.unconfirmedTransactions.push(unconfirmedTransaction),
        err => {
          this.errorMessage = err.message;
        });

    this.listener
      .status(address)
      .subscribe(status => this.statusErrors.push(status),
        err => {
          this.errorMessage = err.message;
        });

    this.listener
      .aggregateBondedAdded(address)
      .subscribe(aggregateTransaction => this.aggregateBondedTransactions.push(aggregateTransaction),
        err => {
          this.errorMessage = err.message;
        });
  }

  sendSafetySeal() {

    this.errorMessage = '';
    this.successMessage = '';

    const productPublicKey = Asset.deterministicPublicKey('company', this.selectedProduct);
    const productAddress = PublicAccount.createFromPublicKey(productPublicKey, NetworkType.MIJIN_TEST).address;

    const operatorAccount = Account
      .createFromPrivateKey(this.privateKey, NetworkType.MIJIN_TEST);

    this.listener.open().then(ignored => {

      this.startListeners(operatorAccount.address);

      const signedTransaction = this.safetySealService.transferSafetySeal(productAddress, operatorAccount);

      if (signedTransaction && signedTransaction.type === TransactionType.TRANSFER) {

        this.transactionHttp
          .announce(signedTransaction)
          .subscribe(x => {
            this.successMessage = x.message;
          }, err => {
            this.errorMessage = err.message;
          });
      }
      else if (signedTransaction) { // Aggregate Bonded Transaction

        const lockFundsTransactionSigned = this.safetySealService.createAndSignLockFundsTransaction(signedTransaction, operatorAccount);

        this.transactionHttp
          .announce(lockFundsTransactionSigned)
          .subscribe(x => console.log(x), err => {
            this.errorMessage = err.message;
          });

        this.listener
          .confirmed(operatorAccount.address)
          .filter((transaction) => transaction.transactionInfo !== undefined
            && transaction.transactionInfo.hash === lockFundsTransactionSigned.hash)
          .flatMap(ignored => this.transactionHttp.announceAggregateBonded(signedTransaction))
          .subscribe(announcedAggregateBonded => {
              this.successMessage = announcedAggregateBonded.message;
            },
            err => {
              this.errorMessage = err.message;
            });
      }

    });

    this.privateKey = '';
  }

}

