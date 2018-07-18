import {Account, TransactionAnnounceResponse, TransactionHttp} from "nem2-sdk";
import {DatabaseService} from "../../service/database.service";
import {ProductModel} from "./product.model";
import {Asset, AssetService} from "nem2-asset-identifier";
import {Observable} from "rxjs/Rx";

export class ProductService {

    private transactionHttp: TransactionHttp;

    constructor() {
        this.transactionHttp = new TransactionHttp(process.env.NODE_URL || 'http://localhost:3000');
    }

    public createProduct(): Observable<ProductModel> {

        return Observable.fromPromise(DatabaseService.ProductDatabase.create())
            .map((_: any) => {
                return new ProductModel(_.dataValues.id);
            });
    }

    public getProducts(): Observable<ProductModel[]> {
        return Observable.fromPromise(DatabaseService.ProductDatabase.all())
            .mergeMap((_): any => _)
            .map((_: any) => new ProductModel(_.dataValues.id))
            .toArray();
    }

    public registerProductInBlockchain(account: Account, productId: number) : Observable<TransactionAnnounceResponse>{

        return new Observable<TransactionAnnounceResponse>();
    }

}