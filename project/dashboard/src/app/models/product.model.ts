import {NetworkType, PublicAccount} from "nem2-sdk";
import {ConstantsService} from "../services/constants.service";
import {sha3_256} from "js-sha3";

export class ProductModel {

  constructor(public readonly id: number) {

  }

  getDeterministicPublicAccount(): PublicAccount {
    const publicKey = sha3_256(ConstantsService.companyName + this.id);
    return PublicAccount.createFromPublicKey(publicKey, NetworkType.MIJIN_TEST);
  }

}
