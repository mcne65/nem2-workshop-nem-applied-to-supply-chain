import {Injectable} from "@angular/core";
import {HttpClient} from '@angular/common/http';
import {ConstantsService} from "./constants.service";
import {
  AccountHttp,
  AccountInfo,
  MosaicAmountView,
  MosaicHttp,
  MosaicService,
  NamespaceHttp,
  PublicAccount,
  Transaction,
  TransactionHttp
} from "nem2-sdk";
import {Observable} from "rxjs/Rx";
import {map, mergeMap, toArray} from "rxjs/operators";
import {ProductModel} from "../models/product.model";

@Injectable()
export class ProductService {

  private accountHttp: AccountHttp;
  private transactionHttp: TransactionHttp;
  private mosaicHttp: MosaicHttp;
  private namespaceHttp: NamespaceHttp;
  private mosaicService: MosaicService;

  constructor(private http: HttpClient) {
    this.accountHttp = new AccountHttp(ConstantsService.nodeURL);
    this.transactionHttp = new TransactionHttp(ConstantsService.nodeURL);
    this.mosaicHttp = new MosaicHttp(ConstantsService.nodeURL);
    this.namespaceHttp = new NamespaceHttp(ConstantsService.nodeURL);
    this.mosaicService = new MosaicService(this.accountHttp, this.mosaicHttp);

  }

  createProduct(): Observable<ProductModel> {
    return this.http.post(ConstantsService.apiURL + '/products/', null)
      .pipe(map(response => new ProductModel(response['id']))
    );
  }

  getAllProducts(): Observable<ProductModel[]> {
    return this.http.get(ConstantsService.apiURL + '/products/')
      .pipe(
        map(response => <Object[]>response),
        mergeMap(_ => _),
        map(product => new ProductModel(product['id'])),
        toArray()
      );
  }

  getProductInfo(publicAccount: PublicAccount): Observable<AccountInfo> {
    return this.accountHttp.getAccountInfo(publicAccount.address);
  }

  getProductTransactions(publicAccount: PublicAccount): Observable<Transaction[]> {
    return this.accountHttp.transactions(publicAccount);
  }

  getProductMosaics(publicAccount: PublicAccount): Observable<MosaicAmountView[]> {
    return this.mosaicService.mosaicsAmountViewFromAddress(publicAccount.address);
  }
}
