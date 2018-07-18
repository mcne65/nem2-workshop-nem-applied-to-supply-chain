import {Injectable} from "@angular/core";
import {Account, Address, Deadline, LockFundsTransaction, NetworkType, SignedTransaction, UInt64, XEM} from "nem2-sdk";

@Injectable()
export class SafetySealService {

  constructor() {
  }

  transferSafetySeal(productAddress: Address, operatorAccount: Account) : SignedTransaction | null{

    //TODO: transfer safety seal
    alert('transferSafetySeal method not implemented');
    return null;
  }

  createAndSignLockFundsTransaction(signedAggregatedTransaction : SignedTransaction, operatorAccount: Account) : SignedTransaction {

    const lockFundsTransaction = LockFundsTransaction.create(
      Deadline.create(),
      XEM.createRelative(10),
      UInt64.fromUint(480),
      signedAggregatedTransaction,
      NetworkType.MIJIN_TEST);

    return operatorAccount.sign(lockFundsTransaction);
  }

}
