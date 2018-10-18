import {Injectable} from '@angular/core';
import {
  AggregateTransaction,
  Deadline,
  ModifyMultisigAccountTransaction,
  MultisigCosignatoryModification,
  MultisigCosignatoryModificationType,
  NetworkType,
  PublicAccount,
  TransactionHttp,
} from 'nem2-sdk';
import {ConstantsService} from './constants.service';


@Injectable()
export class MultisigService {

  private transactionHttp: TransactionHttp;

  constructor() {
    this.transactionHttp = new TransactionHttp(ConstantsService.nodeURL);
  }

  createMultisigAccountTransaction(multisigCandidate: PublicAccount,
                                   minApproval: number,
                                   minRemoval: number,
                                   cosignatories: PublicAccount[]): AggregateTransaction | undefined {

    // Todo: createMultisig method not implemented
    alert('createMultisig method not implemented');
    return undefined;
  }
}
