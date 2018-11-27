import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {
  Account,
  AggregateTransaction,
  Deadline,
  Listener,
  ModifyMultisigAccountTransaction,
  MultisigCosignatoryModification,
  MultisigCosignatoryModificationType,
  NetworkType,
  PublicAccount,
  TransactionHttp,
} from 'nem2-sdk';
import {isValidPublicKey} from '../../validators/nem.validator';
import {filter} from "rxjs/operators";
import {ConstantsService} from "../../services/constants.service";
import {MultisigService} from '../../services/multisig.service';

@Component({
  selector: 'app-create-multisig-account',
  templateUrl: './createMultisigAccount.component.html'
})
export class CreateMultisigAccountComponent implements OnInit {

  createMultisigForm: FormGroup;
  transactionHttp: TransactionHttp;
  listener: Listener;
  progress: Object;

  constructor(private formBuilder: FormBuilder, private multisigService: MultisigService) {

    this.listener = new Listener(ConstantsService.listenerURL, WebSocket);
    this.transactionHttp = new TransactionHttp(ConstantsService.nodeURL);

    this.createMultisigForm = this.formBuilder.group({
      'privateKey': ['', Validators.required],
      'newCosignatories': formBuilder.array([this.createPublicKeyInput()]),
      'minApproval': [0, Validators.required],
      'minRemoval': [0, Validators.required]
    });

  }

  createPublicKeyInput(): FormGroup {
    return this.formBuilder.group({
      publicKey : ['', isValidPublicKey]
    });
  }

  addCosignatory() {
    const cosignatories = this.createMultisigForm.get('newCosignatories') as FormArray;
    cosignatories.controls.push(this.createPublicKeyInput());
  }

  createMultisigAccount(form) {

    const account = Account.createFromPrivateKey(form.privateKey, NetworkType.MIJIN_TEST);

    const aggregateTransaction = this.multisigService
      .createMultisigAccountTransaction(account.publicAccount, form.minApproval, form.minRemoval, form.newCosignatories);

    const signedTransaction = account.sign(aggregateTransaction!);

    this.listener.open().then(() => {
      this.listener
        .confirmed(account.address)
        .pipe(
          filter((transaction) => transaction.transactionInfo !== undefined
            && transaction.transactionInfo.hash === signedTransaction.hash)
        )
        .subscribe(ignored =>  this.progress = {'message': 'Transaction confirmed', 'code': 'CONFIRMED'},
          err =>  this.progress = {'message': err, 'code': 'ERROR'});

      this.listener
        .status(account.address)
        .pipe(
          filter( (status) => status.hash === signedTransaction.hash)
        )
        .subscribe(errorStatus =>  this.progress = {'message': errorStatus.status, 'code': 'ERROR'},
          err =>  this.progress = {'message': err, 'code': 'ERROR'});

    });

    this.transactionHttp
      .announce(signedTransaction)
      .subscribe( ignored =>
          this.progress = {'message': 'Transaction unconfirmed', 'code': 'UNCONFIRMED'},
        err => this.progress = {'message': err, 'code': 'ERROR'});
  }

  ngOnInit() {}

}
