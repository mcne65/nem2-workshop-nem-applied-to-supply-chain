import {Injectable} from "@angular/core";
import {
  Account,
  Deadline,
  ModifyMultisigAccountTransaction,
  MultisigCosignatoryModification,
  MultisigCosignatoryModificationType,
  NetworkType,
  PublicAccount,
  SignedTransaction,
  TransactionHttp,
} from "nem2-sdk";
import {ConstantsService} from "./constants.service";


@Injectable()
export class MultisigService {

  private transactionHttp: TransactionHttp;

  constructor() {
    this.transactionHttp = new TransactionHttp(ConstantsService.nodeURL);
  }

  createMultisig(account: Account, minApproval: number, cosignatories: PublicAccount[]) : SignedTransaction {

    //TODO: createMultisig method not implemented
    alert('createMultisig method not implemented');
    return new SignedTransaction();

  }
}
