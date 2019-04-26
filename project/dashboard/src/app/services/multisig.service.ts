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
                                   cosignatories: PublicAccount[]): AggregateTransaction {

    const newCosignatories = cosignatories.map( cosignatory => {
      const publicAccount = PublicAccount.createFromPublicKey(cosignatory.publicKey, NetworkType.MIJIN_TEST);
      return new MultisigCosignatoryModification(MultisigCosignatoryModificationType.Add, publicAccount);
    });

    const modifyMultisigAccountTransaction = ModifyMultisigAccountTransaction.create(
      Deadline.create(),
      minApproval,
      minRemoval,
      newCosignatories,
      NetworkType.MIJIN_TEST);

    return AggregateTransaction.createComplete(
      Deadline.create(),
      [modifyMultisigAccountTransaction.toAggregate(multisigCandidate)],
      NetworkType.MIJIN_TEST,
      []);
  }
}
