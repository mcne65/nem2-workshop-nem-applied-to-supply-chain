import {
    Account,
    NetworkType,
    TransferTransaction,
    Deadline,
    PlainMessage,
    PublicAccount,
    TransactionAnnounceResponse,
    TransactionHttp
} from "nem2-sdk";
import {DatabaseService} from "../../service/database.service";
import {ProductModel} from "./product.model";
import {Observable} from "rxjs/Rx";
import {of, from, scheduled, asapScheduler} from 'rxjs';
import {mergeMap, map, toArray} from "rxjs/operators";
import {sha3_256} from "js-sha3";

export class ProductService {

    private transactionHttp: TransactionHttp;

    constructor() {
        this.transactionHttp = new TransactionHttp(process.env.NODE_URL || "http://localhost:3000");
    }

    private registerProductInBlockchain(product: ProductModel): Observable<TransactionAnnounceResponse> {
        // Todo: Register the product in blockchain
        return scheduled(of(new TransactionAnnounceResponse()), asapScheduler);
    }

    public createProduct(): Observable<ProductModel> {
        return scheduled(from(DatabaseService.ProductDatabase.create()), asapScheduler)
            .pipe(
                map((_: any) => {
                    return new ProductModel(_.dataValues.id);
                }),
                mergeMap((product) => {
                    return this.registerProductInBlockchain(product)
                        .pipe(map((ignored) => product));
                })
            );
    }

    public getProducts(): Observable<ProductModel[]> {
        return scheduled(from(DatabaseService.ProductDatabase.findAll()), asapScheduler)
            .pipe(
                mergeMap((_): any => _),
                map((_: any) => new ProductModel(_.dataValues.id)),
                toArray(),
            );
    }
}
