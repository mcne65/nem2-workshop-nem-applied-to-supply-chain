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

export class SensorService {

    private transactionHttp: TransactionHttp;
    private listener: Listener;

    constructor() {
        this.transactionHttp = new TransactionHttp(process.env.NODE_URL || 'http://localhost:3000');
        this.listener = new Listener(process.env.NODE_URL || 'http://localhost:3000');
    }

    startListening() {

        const sensorPrivateKey = process.env.SENSOR_PRIVATE_KEY as string;
        const sensorAccount = Account.createFromPrivateKey(sensorPrivateKey, NetworkType.MIJIN_TEST);

        this.listener.open().then(_ => {

            const address = process.env.SAFETY_DEPARTMENT_ADDRESS ?
                Address.createFromRawAddress(process.env.SAFETY_DEPARTMENT_ADDRESS) : sensorAccount.address;

            this.listener
                .aggregateBondedAdded(address)
                .pipe(
                    filter((_) => !_.signedByAccount(sensorAccount.publicAccount)),
                    mergeMap(transaction => this.digitalInspection(transaction, sensorAccount))
                )
                .subscribe(announcedTransaction => console.log(announcedTransaction),
                    err => console.log(err));
        });
    }

    private inspect() {
        const inspection = Math.floor(Math.random() * 6);
        return (inspection < 2.5);
    }

    private announceCosignatureTransaction(transaction: AggregateTransaction, sensorAccount: Account): Observable<TransactionAnnounceResponse> {
        const cosignatureTransaction = CosignatureTransaction.create(transaction);
        const cosignatureSignedTransaction = sensorAccount.signCosignatureTransaction(cosignatureTransaction);
        return this.transactionHttp.announceAggregateBondedCosignature(cosignatureSignedTransaction);
    }

    private announceErrorTransaction(recipient: Address, sensorAccount: Account): Observable<TransactionAnnounceResponse> {
        const transferTransaction = TransferTransaction.create(
            Deadline.create(),
            recipient,
            [],
            PlainMessage.create('Invalid inspection'),
            NetworkType.MIJIN_TEST
        );

        const signedTransaction = sensorAccount.sign(transferTransaction);
        return this.transactionHttp.announce(signedTransaction);
    }

    private digitalInspection(transaction: AggregateTransaction, sensorAccount: Account): Observable<TransactionAnnounceResponse> {
        // Assuming all inner transactions send to this account are inner transactions
        const product: TransferTransaction = <TransferTransaction> transaction.innerTransactions[0];
        if (this.inspect()) return this.announceErrorTransaction(product.recipient, sensorAccount);
        else return this.announceCosignatureTransaction(transaction, sensorAccount);
    }
}