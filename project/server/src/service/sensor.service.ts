import {
    Account,
    Address,
    AggregateTransaction,
    CosignatureTransaction,
    Deadline,
    Listener,
    NetworkType,
    PlainMessage,
    TransactionAnnounceResponse,
    TransactionHttp,
    TransferTransaction
} from "nem2-sdk";
import {Observable} from "rxjs/Rx";
import {mergeMap, filter} from "rxjs/operators";

// tslint:disable:no-console
export class SensorService {

    private transactionHttp: TransactionHttp;
    private listener: Listener;

    constructor() {
        this.transactionHttp = new TransactionHttp(process.env.NODE_URL || "http://localhost:3000");
        this.listener = new Listener(process.env.NODE_URL || "http://localhost:3000");
    }

    public startListening() {

        const sensorPrivateKey = process.env.SENSOR_PRIVATE_KEY as string;
        const sensorAccount = Account.createFromPrivateKey(sensorPrivateKey, NetworkType.MIJIN_TEST);

        this.listener.open().then((ignored) => {

            const address = process.env.SAFETY_DEPARTMENT_ADDRESS ?
                Address.createFromRawAddress(process.env.SAFETY_DEPARTMENT_ADDRESS) : sensorAccount.address;

            this.listener
                .aggregateBondedAdded(address)
                .pipe(
                    filter((_) => !_.signedByAccount(sensorAccount.publicAccount)),
                    mergeMap( (transaction) => this.digitalInspection(transaction, sensorAccount)),
                )
                .subscribe( (announcedTransaction) => console.log(announcedTransaction),
                    (err) => console.log(err));
        });
    }

    private inspect() {
        const inspection = Math.floor(Math.random() * 6);
        return (inspection < 2.5);
    }

    private announceCosignatureTransaction(transaction: AggregateTransaction, sensorAccount: Account)
    : Observable<TransactionAnnounceResponse> {
        const cosignatureTransaction = CosignatureTransaction.create(transaction);
        const cosignatureSignedTransaction = sensorAccount.signCosignatureTransaction(cosignatureTransaction);
        return this.transactionHttp.announceAggregateBondedCosignature(cosignatureSignedTransaction);
    }

    private announceErrorTransaction(recipient: Address, sensorAccount: Account)
    : Observable<TransactionAnnounceResponse> {
        const transferTransaction = TransferTransaction.create(
            Deadline.create(),
            recipient,
            [],
            PlainMessage.create("Invalid inspection"),
            NetworkType.MIJIN_TEST,
        );

        const signedTransaction = sensorAccount.sign(transferTransaction);
        return this.transactionHttp.announce(signedTransaction);
    }

    private digitalInspection(transaction: AggregateTransaction, sensorAccount: Account)
    : Observable<TransactionAnnounceResponse> {
        // Assuming all inner transactions sent to this account are transfer transactions
        const product: TransferTransaction = transaction.innerTransactions[0] as TransferTransaction;
        if (this.inspect() && product.recipient instanceof Address) {
            return this.announceErrorTransaction(product.recipient, sensorAccount);
        }
        return this.announceCosignatureTransaction(transaction, sensorAccount);
    }
}
