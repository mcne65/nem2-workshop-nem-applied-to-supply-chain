import {Injectable} from "@angular/core";
import {
  Account,
  Address,
  AggregateTransaction,
  Deadline,
  EmptyMessage,
  LockFundsTransaction,
  Mosaic,
  MosaicId,
  NetworkType,
  PlainMessage,
  PublicAccount,
  SignedTransaction,
  TransferTransaction,
  UInt64,
  XEM
} from "nem2-sdk";

@Injectable()
export class SafetySealService {

  constructor() {
  }

  createSafetySealTransaction(productAddress: Address): TransferTransaction | undefined {

    // Todo: transfer safety seal
    alert('transferSafetySeal method not implemented');
    return undefined;
  }

  createLockFundsTransaction(signedAggregatedTransaction: SignedTransaction): LockFundsTransaction {

    return LockFundsTransaction.create(
      Deadline.create(),
      XEM.createRelative(10),
      UInt64.fromUint(480),
      signedAggregatedTransaction,
      NetworkType.MIJIN_TEST);

  }

}
