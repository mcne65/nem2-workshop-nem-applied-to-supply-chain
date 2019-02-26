---
layout: post
title:  "Adding a digital sensor"
permalink: /lessons/adding-a-digital-sensor/
---

## Background

Recently, the company has included digital sensors to automatize part of the process. The goal is to decrease human errors, providing a new source of reliability.

The warehouse operator still needs to check that the product meets the standards. After the warehouse operator announces the safety seal request, a sensor performs a digital inspection. The digital sensor confirms or denies the safety seal request.

* If accepted, the safety seal is sent to the product. 
* If denied, the sensor sends a transaction to the product, stating the product has not passed the inspection process.

![use-case-nem-adding-a-sensor]({{ site.baseurl }}/assets/images/use-case-nem-adding-a-sensor.png)

If we were putting the application logic inside the blockchain, this  little change means throwing the published smart contract. This leads to  spend more time in development and increasing the cost of the platform.

Using NEM, we still need to change our code. In most cases, making changes takes the same as if we were developing an application that is not using blockchain technology.

### Aggregated Transactions

[Aggregated Transactions](https://nemtech.github.io/concepts/aggregate-transaction.html) merge multiple transactions into one, allowing trustless swaps and other advanced logic. NEM does this by generating a one-time disposable smart contract. When all involved accounts have cosigned the transaction, all of them are executed at once.

## Solution

### New Actor: Digital Safety Sensor 

We should decide how we represent the digital safety sensor in our existing project.

The digital sensor requires to cosign transactions. That's the reason why it is represented as an account.

Create digital safety sensor account.

{% highlight bash %}
  nem2-cli account generate --network MIJIN_TEST --url http://localhost:3000 --profile sensor --save 
{% endhighlight %}


### Modify createSafetySealTransaction function

1\. Open ``project/dashboard/src/app/services/safetySeal.service.ts``, and modify ``transferSafetySeal`` function.

2\. Create two transfer transactions:

* **operatorToProductTransaction**:Transfer Transaction to product address, sending one company.safety seal.
* **sensorToProductTransaction**: Transfer Transaction to product address, with the message inspection, passed.

{% highlight typescript %}
createSafetySealTransaction(productAddress: Address, operatorAccount: PublicAccount): AggregateTransaction {

    const sensorPublicKey = ''; // Todo: Paste sensor account public key
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
      PlainMessage.create('Inspection passed'),
      NetworkType.MIJIN_TEST
    );
        
    [...]  
}   
{% endhighlight %}

3\. Then, wrap these transfer transactions inside an aggregate transaction. State who the signers of each transaction are.

An aggregated transaction is complete if all required cosigners have  signed it.

The warehouse operator will sign and announce the transaction, so we still require the signature from the digital sensor. We call this type of transactions ``aggregate bonded``.

{% highlight typescript %}
createSafetySealTransaction(productAddress: Address, operatorAccount: PublicAccount): AggregateTransaction {

    const sensorPublicKey = ''; // Todo: Paste sensor account public key
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
      PlainMessage.create('Inspection passed'),
      NetworkType.MIJIN_TEST
    );
    
    return AggregateTransaction.createBonded(
      Deadline.create(),
      [
        operatorToProductTransaction.toAggregate(operatorAccount),
        sensorToProductTransaction.toAggregate(sensorPublicAccount)
      ],
      NetworkType.MIJIN_TEST);
}
{% endhighlight %}

4\. Open ``project/dashboard/src/app/components/sendsafetySeal.component.ts`` and edit ``sendSafetySeal()`` function.

When an aggregate transaction is bonded, the warehouse operator needs to lock at least ``10 XEM``.

Once the sensor cosigns the aggregate transaction, the amount of locked XEM becomes available again on the warehouse operator's account, and both transactions are executed atomically.

5\. Create a lock funds transaction, locking 10 XEM for the hash of the signed transaction.

{% highlight typescript %}
sendSafetySeal(form) {

    const operatorAccount = Account
      .createFromPrivateKey(form.privateKey, NetworkType.MIJIN_TEST);
    const productPublicKey = Asset.deterministicPublicKey('company', form.selectedProduct);
    const productAddress = PublicAccount.createFromPublicKey(productPublicKey, NetworkType.MIJIN_TEST).address;

    const safetySealTransaction = this.safetySealService.createSafetySealTransaction(productAddress, operatorAccount.publicAccount);
    const signedTransaction = operatorAccount.sign(safetySealTransaction!);

    const lockFundsTransaction = this.safetySealService.createLockFundsTransaction(signedTransaction);

    const signedLockFundsTransaction = operatorAccount.sign(lockFundsTransaction);

    [...]
}
{% endhighlight %}


6\.  Announce the lock funds transaction and wait until it gets confirmed. Then, announce the aggregate bonded transaction.

{% highlight typescript %}
sendSafetySeal(form) {

    const operatorAccount = Account
      .createFromPrivateKey(form.privateKey, NetworkType.MIJIN_TEST);
    const productPublicKey = Asset.deterministicPublicKey('company', form.selectedProduct);
    const productAddress = PublicAccount.createFromPublicKey(productPublicKey, NetworkType.MIJIN_TEST).address;

    const safetySealTransaction = this.safetySealService.createSafetySealTransaction(productAddress, operatorAccount.publicAccount);
    const signedTransaction = operatorAccount.sign(safetySealTransaction!);

    const lockFundsTransaction = this.safetySealService.createLockFundsTransaction(signedTransaction);

    const signedLockFundsTransaction = operatorAccount.sign(lockFundsTransaction);

    this.listener.open().then(ignored => {

      this.startListeners(operatorAccount.address);

      this.transactionHttp
        .announce(signedLockFundsTransaction)
        .subscribe(x => console.log(x), err => console.log(err));

      this.listener
        .confirmed(operatorAccount.address)
        .pipe(
          filter((transaction) => transaction.transactionInfo !== undefined
            && transaction.transactionInfo.hash === signedLockFundsTransaction.hash),
          mergeMap(ignored => this.transactionHttp.announceAggregateBonded(signedTransaction))
        )
        .subscribe(announcedAggregateBonded => console.log(announcedAggregateBonded),
          err => console.log(err));
    });
  }
{% endhighlight %}

### Simulating the digital sensor behaviour

The ``server`` already has a service implemented simulating the digital sensor behaviour.

Open ``project/server/.env``, and add the sensor account's private key.

{% highlight bash %}

SENSOR_PRIVATE_KEY='134..............526'

{% endhighlight %}

If you are interested, [review the sensor's code here](https://github.com/nemtech/nem2-workshop-nem-applied-to-supply-chain/blob/v0.2.0/project/server/src/service/sensor.service.ts).

    ℹ️ In a production environment, you would need to perform further checks, like reviewing the account who announced the transaction, as well as its content.
        
The server opens a listener connection. It is notified when a new aggregate bonded transaction arrives to this account.
 
At that moment, ``digitalInspection()`` function is called. It returns a random number between 0 and 5. If it is bigger than 2.5, the product passes the inspection and the transaction is cosigned.

If the number is less than 2.5, the sensor sends a Transfer Transaction with the message ``Invalid inspection``.

## Testing your changes

1\. **Restart the server to apply the changes**, and click on the ``Send Safety Seal`` button.

After the lock funds transaction is confirmed, you should see the transaction under ``Aggregate bonded added`` section.

![screenshot-aggregate-bonded-added]({{ site.baseurl }}/assets/images/screenshot-aggregate-bonded-added.png)

The sensor has cosigned the transaction automatically or sent a transfer transaction to your product.

2\. Go to the product detail page. Has the product passed the safety test?

![screenshot-product-detail-inspection-failed]({{ site.baseurl }}/assets/images/screenshot-product-detail-inspection-failed.png)

3\. Repeat the process several times with different products, until one of them gets the safety seal.

![screenshot-product-detail-inspection-passed]({{ site.baseurl }}/assets/images/screenshot-product-detail-inspection-passed.png)
