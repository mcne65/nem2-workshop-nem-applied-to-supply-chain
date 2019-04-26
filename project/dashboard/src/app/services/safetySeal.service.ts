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
  NetworkCurrencyMosaic,
  NamespaceId
} from "nem2-sdk";
import {ConstantsService} from "./constants.service";
import {Observable, scheduled, asapScheduler, from} from "rxjs";
import {map} from "rxjs/operators";

@Injectable()
export class SafetySealService {

  constructor() {
  }

  createSafetySealTransaction(productAddress: Address): TransferTransaction | undefined {

    // Todo: transfer safety seal
    alert('transferSafetySeal method not implemented');
    return undefined;
  }

  createLockFundsTransaction(nativeCurrencyMosaic: MosaicId, signedAggregatedTransaction: SignedTransaction): LockFundsTransaction {
    return LockFundsTransaction.create(
      Deadline.create(),
      new Mosaic(nativeCurrencyMosaic, UInt64.fromUint(10000000)),
      UInt64.fromUint(480),
      signedAggregatedTransaction,
      NetworkType.MIJIN_TEST);
  }
}
