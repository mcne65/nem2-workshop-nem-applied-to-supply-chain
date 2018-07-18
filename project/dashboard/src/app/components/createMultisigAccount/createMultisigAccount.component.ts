import {Component, OnInit} from '@angular/core';

import {
  Account,
  Address,
  Listener,
  ModifyMultisigAccountTransaction,
  NetworkType,
  PublicAccount,
  TransactionHttp
} from "nem2-sdk";
import {ConstantsService} from "../../services/constants.service";
import {MultisigService} from "../../services/multisig.service";


@Component({
  selector: 'app-create-multisig-account',
  templateUrl: './createMultisigAccount.component.html',

})


export class CreateMultisigAccountComponent implements OnInit {

  transactionHttp: TransactionHttp;
  listener: Listener;
  privateKey: string;
  minApproval: number;
  cosignatories: string[];
  errorMessage: string;
  successMessage: string;
  progress: string;

  constructor(private multisigService: MultisigService) {
    this.transactionHttp = new TransactionHttp(ConstantsService.nodeURL);
    this.listener = new Listener(ConstantsService.listenerURL, WebSocket);
    this.privateKey = '';
    this.minApproval = 1;
    this.cosignatories = ['',];
    this.errorMessage = '';
    this.successMessage = '';
    this.progress = '';
  }

  ngOnInit() {}

  areAccountsValid(){

    try{
      this.cosignatories.map(cosignatory => {
        return PublicAccount.createFromPublicKey(cosignatory, NetworkType.MIJIN_TEST);
      });
      Account.createFromPrivateKey(this.privateKey, NetworkType.MIJIN_TEST);
      return true;
    }
    catch(e){
      return false;
    }
  }

  addCosignatory() {
    this.cosignatories.push('');
  }

  createMultisig() {

    this.successMessage = '';
    this.errorMessage = '';

    const account = Account
      .createFromPrivateKey(this.privateKey, NetworkType.MIJIN_TEST);

    const cosignatories = this.cosignatories.map(cosignatory => {
      return PublicAccount.createFromPublicKey(cosignatory, NetworkType.MIJIN_TEST);
    });

    const signedTransaction = this.multisigService.createMultisig(account, this.minApproval, cosignatories);

    this.listener.open().then(() => {

      this.startListeners(account.address, signedTransaction.hash);

      this.transactionHttp
        .announce(signedTransaction)
        .subscribe(x => {
            this.successMessage = x.message;
          },
          err => {
            this.errorMessage = err;
          });

    });

    this.privateKey = '';
  }

  private startListeners(address: Address, hash: string) {
    this.listener
      .status(address)
      .subscribe(errorStatus => {
          this.progress = errorStatus.status;
        }, err => console.error(err));

    this.listener
      .unconfirmedAdded(address)
      .filter((transaction) => transaction instanceof ModifyMultisigAccountTransaction
        && transaction.transactionInfo !== undefined
        && transaction.transactionInfo.hash === hash)
      .subscribe(ignored => {
          this.progress = 'Transaction unconfirmed';
        }, err => console.error(err));

    this.listener
      .confirmed(address)
      .filter((transaction) => transaction instanceof ModifyMultisigAccountTransaction
        && transaction.transactionInfo !== undefined
        && transaction.transactionInfo.hash === hash)
      .subscribe(ignored => {
          this.progress = 'Transaction confirmed';
        }, err => console.error(err));
  }
}
