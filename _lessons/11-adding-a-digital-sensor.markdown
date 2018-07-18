---
layout: post
title:  "Adding a digital sensor"
permalink: /lessons/adding-a-digital-sensor/
---

![use-case-nem-adding-a-sensor]({{ site.baseurl }}/assets/images/use-case-nem-adding-a-sensor.png)

Recently, the company has included digital sensors to automatize part of the process. The objective is to decrease human errors, providing a new source of reliability.

If we were putting our application logic inside the blockchain, applying this little change could derive in tackling it with immutability, spending prolonged time in development and increasing the cost of the platform.

Using NEM, we still need to do some changes to our code. In most cases, and as application logic is not coupled entirely with NEM, making changes to the system won't take extra time. Generally, it takes the same as if we were developing an application that is not using blockchain technology.

The warehouse operator still needs to check that the product meets the standards. After the warehouse operator announces the safety seal request, a sensor performs a digital inspection, confirming or denying the safety seal request.

If accepted, the safety seal is sent to the product. In the second case, the sensor sends a transaction to the product, specifying that the product has not passed the inspection process.

To solve this case efficiently, think about using the **Aggregated Transaction** built-in feature. 

## Aggregated Transactions

[Aggregated Transactions](https://nemtech.github.io/concepts/aggregate-transaction.html) merge multiple transactions into one, allowing trustless swaps and other advanced logic. NEM does this by generating a one-time disposable smart contract. When all involved accounts have cosigned the transaction, all of them are executed at once.


## Solution

### New Actor: Digital Safety Sensor 

We should decide how we represent the digital safety sensor in our existing project.

The digital sensor requires to cosign transactions. That's the reason why it is represented as an account.

Create digital safety sensor account.

{% highlight bash %}
  nem2-cli account generate --network MIJIN_TEST --url http://localhost:3000 --profile sensor --save 
{% endhighlight %}


### Modify transferSafetySeal function

Now that you have created the digital inspector account, open ``project/dashboard/src/app/services/safetySeal.service.ts``, and modify ``transferSafetySeal`` function.

Create two transfer transactions:

1. Transfer Transaction to product address, sending one company.safety seal.
2. Transfer Transaction to product address, with the message inspection, passed.

Then, we wrap these transfer transactions inside a transfer transaction, specifying who the signers of each transaction are.

An aggregate Transaction is complete if before announcing it to the network, all required cosigners have signed it. If valid, it will be included in a block.

The warehouse operator signs and sends the transaction, so we still require the signature from the digital sensor. We call this type of transactions ``aggregate bonded``.

When an aggregate transaction is bonded, the warehouse operator needs to lock at least ``10 XEM``.

Once the sensor cosigns the aggregate transaction, the amount of locked XEM becomes available again on the warehouse operator's account, and both transactions are executed atomically.

{% highlight typescript %}
  transferSafetySeal(productAddress: Address, operatorAccount: Account) : SignedTransaction {
    
    const sensorPublicKey = ''; //TODO: Paste sensor account public key
    const sensorPublicAccount = PublicAccount.createFromPublicKey(sensorPublicKey, NetworkType.MIJIN_TEST);
    
    const operatorToProductTransaction = TransferTransaction.create(
      Deadline.create(),
      productAddress,
      [new Mosaic(new MosaicId('company.safety:seal'), UInt64.fromUint(1))],
      EmptyMessage,
      NetworkType.MIJIN_TEST
    );

    const sensorToProductTransaction = TransferTransaction.create(
      Deadline.create(),
      productAddress,
      [],
      PlainMessage.create("Inspection passed"),
      NetworkType.MIJIN_TEST
    );

    const aggregateTransaction = AggregateTransaction.createBonded(
      Deadline.create(),
      [
        operatorToProductTransaction.toAggregate(operatorAccount.publicAccount),
        sensorToProductTransaction.toAggregate(sensorPublicAccount)
      ],
      NetworkType.MIJIN_TEST);

    return operatorAccount.sign(aggregateTransaction);

  }
{% endhighlight %}


Open ``project/dashboard/src/app/components/sendsafetySeal.component.ts`` and check how aggregate bonded transactions are announced:

1. Create and sign the aggregate bonded transaction.
2. Create a lock funds transaction, locking 10 XEM for the hash of the signed transaction.
3. Announce the lock funds transaction and wait until it gets confirmed.
4. Announce the aggregate bonded transaction.  

{% highlight typescript %}

    const lockFundsTransactionSigned = this.safetySealService.createAndSignLockFundsTransaction(signedTransaction, operatorAccount);

    this.transactionHttp
      .announce(lockFundsTransactionSigned)
      .subscribe(x => console.log(x), err => console.error(err));

    this.listener
      .confirmed(operatorAccount.address)
      .filter((transaction) => transaction.transactionInfo !== undefined
        && transaction.transactionInfo.hash === lockFundsTransactionSigned.hash)
      .flatMap(ignored => this.transactionHttp.announceAggregateBonded(signedTransaction))
      .subscribe(announcedAggregateBonded => console.log(announcedAggregateBonded),
        err => console.error(err));
{% endhighlight %}

### Simulating the digital sensor behaviour

The ``server`` already has a service implemented simulating the digital sensor behaviour.

Open ``project/server/.env``, and add the sensor account's private key.

{% highlight bash %}

SENSOR_PRIVATE_KEY='134..............526'

{% endhighlight %}

The sensor is running the following code ``project/server/src/service/sensor.service.ts``.

{% highlight typescript %}

    startListening() {

        const sensorPrivateKey = process.env.SENSOR_PRIVATE_KEY as string;
        const sensorAccount = Account.createFromPrivateKey(sensorPrivateKey, NetworkType.MIJIN_TEST);

        this.listener.open().then(_ => {

            const address = process.env.SAFETY_DEPARTMENT_ADDRESS ?
                Address.createFromRawAddress(process.env.SAFETY_DEPARTMENT_ADDRESS) : sensorAccount.address;

            this.listener
                .aggregateBondedAdded(address)
                .filter((_) => !_.signedByAccount(sensorAccount.publicAccount))
                .flatMap(transaction => this.digitalInspection(transaction, sensorAccount))
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
    
{% endhighlight %}

    ℹ️ In a production environment, you would need to perform further checks, like reviewing the account who announced the transaction, as well as its content.
        
The server opens a listener connection, being notified when a new aggregate bonded transaction arrives to this account.
 
At that moment, ``digitalInspection()`` function is called. It returns a random number between 0 and 5. If it is bigger than 2.5, the product passes the inspection and the transaction is cosigned.

If the number is inferior to 2.5, the sensor sends a Transfer Transaction, with the message ``Invalid inspection``.

## Testing your changes

**Restart the server to apply the changes**, and click on the ``Send Safety Seal`` button.

After the lock funds transaction is confirmed, you should see the transaction under ``Aggregate bonded added`` section.

![screenshot-aggregate-bonded-added]({{ site.baseurl }}/assets/images/screenshot-aggregate-bonded-added.png)

The sensor has cosigned the transaction automatically or sent a transfer transaction to your product.

Go to the product detail page. Has the product passed the safety test?

![screenshot-product-detail-inspection-failed]({{ site.baseurl }}/assets/images/screenshot-product-detail-inspection-failed.png)

Repeat the process several times with different products, until one of them gets the safety seal.

![screenshot-product-detail-inspection-passed]({{ site.baseurl }}/assets/images/screenshot-product-detail-inspection-passed.png)
