import {Injectable} from "@angular/core";
import {HttpClient} from '@angular/common/http';
import {ConstantsService} from "./constants.service";
import {
  AccountHttp,
  AccountInfo,
  MosaicAmountView,
  MosaicService,
  NetworkType,
  PublicAccount,
  Transaction,
  TransactionHttp,
  MosaicHttp,
  NamespaceHttp
} from "nem2-sdk";
import {Asset} from "nem2-asset-identifier";
import {Observable} from "rxjs/Rx";

@Injectable()
export class ProductService {

  private accountHttp: AccountHttp;
  private transactionHttp: TransactionHttp;
  private mosaicHttp: MosaicHttp;
  private namespaceHttp: NamespaceHttp;
  private mosaicService: MosaicService;

  constructor(private http:HttpClient){
    this.accountHttp = new AccountHttp(ConstantsService.nodeURL);
    this.transactionHttp = new TransactionHttp(ConstantsService.nodeURL);
    this.mosaicHttp = new MosaicHttp(ConstantsService.nodeURL);
    this.namespaceHttp = new NamespaceHttp(ConstantsService.nodeURL);
    this.mosaicService = new MosaicService(this.accountHttp, this.mosaicHttp, this.namespaceHttp);

  }

  createProduct()  : Observable<Object>  {
    return this.http.post(ConstantsService.apiURL+'/products/', null);
  }

  getDeterministicPublicAccount(id: string)  : PublicAccount {
    const asset = Asset.deterministicPublicKey('company', id);
    return PublicAccount.createFromPublicKey(asset, NetworkType.MIJIN_TEST);
  }

  getAllProducts()  : Observable<Object> {
    return this.http.get(ConstantsService.apiURL+'/products/');
  }

  getProductInfo(publicAccount: PublicAccount) : Observable<AccountInfo> {
    return this.accountHttp.getAccountInfo(publicAccount.address);
  }

  getProductTransactions(publicAccount:PublicAccount) : Observable<Transaction[]> {
    return this.accountHttp.transactions(publicAccount);
  }

  getProductMosaics(publicAccount: PublicAccount): Observable<MosaicAmountView[]> {
    return this.mosaicService.mosaicsAmountViewFromAddress(publicAccount.address);
  }
}
