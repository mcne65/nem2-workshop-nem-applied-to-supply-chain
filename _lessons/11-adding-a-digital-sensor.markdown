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

![use-case-nem-adding-a-sensor]({{ site.baseurl }}/assets/images/use-case-nem-adding-a-sensor.png){:width="600px"}

If we were putting the application logic inside the blockchain, this little change would mean throwing the published smart contract. In other words,  spending more time on development and increasing the cost of the platform.

Using NEM, we still need to change our code. In most cases, making changes takes the same as if we were developing an application that is not using blockchain technology.

### Aggregated Transactions

[Aggregated Transactions](https://nemtech.github.io/concepts/aggregate-transaction.html) merge multiple transactions into one, allowing trustless swaps and other advanced logic. NEM does this by generating a one-time disposable smart contract. When all involved accounts have cosigned the transaction, all of them are executed at the same time.

## Instructions

### New Actor: Digital Safety Sensor 

We should decide how we represent the digital safety sensor in our existing project.

The digital sensor requires to cosign transactions. That's why we opt to represent it as an account.

Create digital safety sensor account.

{% highlight console %}
  nem2-cli account generate --network MIJIN_TEST --url http://localhost:3000 --profile sensor --save 
{% endhighlight %}


### Modify createSafetySealTransaction function

1\. Open ``project/dashboard/src/app/services/safetySeal.service.ts``, and modify ``transferSafetySeal`` function.

2\. Create two transfer transactions:

* **operatorToProductTransaction**:Transfer Transaction to product address, sending one company.safetyseal.
* **sensorToProductTransaction**: Transfer Transaction to product address, with the message "Inspection passed".

{% highlight typescript %}
createSafetySealTransaction(productAddress: Address, operatorAccount: PublicAccount): AggregateTransaction {

    const sensorPublicKey = ''; // Todo: Paste sensor account public key
    const sensorPublicAccount = PublicAccount.createFromPublicKey(sensorPublicKey, NetworkType.MIJIN_TEST);

    const operatorToProductTransaction = TransferTransaction.create(
      Deadline.create(),
      productAddress,
      [new Mosaic(new NamespaceId('company.safetyseal'), UInt64.fromUint(1))],
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

3\. Wrap the transfer transactions inside an aggregate transaction. State who will be the signer of each transaction.

An aggregated transaction is complete if all required cosigners have signed it before announcing it to the network.

The warehouse operator will sign and announce the transaction, so we still require the signature from the digital sensor. This type of transaction is named ``aggregate bonded``.

{% highlight typescript %}
createSafetySealTransaction(productAddress: Address, operatorAccount: PublicAccount): AggregateTransaction {

    const sensorPublicKey = ''; // Todo: Paste sensor account public key
    const sensorPublicAccount = PublicAccount.createFromPublicKey(sensorPublicKey, NetworkType.MIJIN_TEST);

    const operatorToProductTransaction = TransferTransaction.create(
      Deadline.create(),
      productAddress,
      [new Mosaic(new NamespaceId('company.safetyseal'), UInt64.fromUint(1))],
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

Sending aggregate transactions shares some similarities with sending a regular transfer transaction. First, we define the transaction, then we sign it and finally, we announce it. 

Nevertheless, when an aggregate transaction is bonded, the sender of the transaction - the operator - needs to lock first at least ``10 cat.currency`` to prevent that the network handles too many forgotten aggregate transactions pending to be signed.

If the sensor cosigns the aggregate transaction, the amount of locked cat.currency will be available again on the warehouse operator's account (sender), and both transactions will be executed atomically.

4\. Open ``project/dashboard/src/app/components/sendsafetySeal.component.ts`` and edit ``sendSafetySeal()`` function.

{% highlight typescript %}
  async sendSafetySeal(form) {
    
    /* 01 - Define the AggregateTransaction */
    const operatorAccount = Account
      .createFromPrivateKey(form.privateKey, NetworkType.MIJIN_TEST);
    const productAddress = new ProductModel(form.selectedProduct).getDeterministicPublicAccount().address;
    const safetySealTransaction = this.safetySealService.createSafetySealTransaction(productAddress, operatorAccount.publicAccount);
   
    /* 02 - Sign the AggregateTransaction */
    const signedTransaction = operatorAccount.sign(safetySealTransaction!);

    /* 03 - Define the LockFundsTransaction */
    const mosaicId = await this.namespaceHttp.getLinkedMosaicId(NetworkCurrencyMosaic.NAMESPACE_ID).toPromise();
    const lockFundsTransaction = this.safetySealService.createLockFundsTransaction(mosaicId, signedTransaction);
    
    /* 04 - Sign the LockFundsTransaction */
    const signedLockFundsTransaction = operatorAccount.sign(lockFundsTransaction);

    this.listener.open().then(ignored => {

      this.startListeners(operatorAccount.address);

      /* 05 - Announce the LockFundsTransaction */
      this.transactionHttp
        .announce(signedLockFundsTransaction)
        .subscribe(x => console.log(x), err => console.log(err));

      /* 06 - Once the LockFundsTransaction gets confirmed, announce the AggregateTransaction */
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

### Simulating the digital sensor behavior

The ``server`` already has a service implemented simulating the digital sensor behavior.

The sensor opens a listener connection. It is notified when a new aggregate bonded transaction is pending to be signed.
 
At that moment, ``digitalInspection()`` function is called. It returns a random number between 0 and 5. If it is bigger than 2.5, the product passes the inspection, and the transaction is cosigned.

If the number is less than 2.5, the sensor sends a Transfer Transaction with the message ``Invalid inspection``.

**Read more**: [Sensor implementation](https://github.com/nemtech/nem2-workshop-nem-applied-to-supply-chain/blob/v0.3.0/project/server/src/service/sensor.service.ts).

Open ``project/server/.env``, and add the private key of the sensor account.

{% highlight console %}
SENSOR_PRIVATE_KEY='134..............526'
{% endhighlight %}

{% include note.html content=" In a production environment, you would need to perform further checks, like reviewing the account which signed the transaction, as well as its content." %}

## Testing your changes

1\. **Restart the server to apply the changes**, and click on the ``Send Safety Seal`` button.

After the lock funds transaction is confirmed, you should see the transaction under ``Aggregate bonded added`` section.

![screenshot-aggregate-bonded-added]({{ site.baseurl }}/assets/images/screenshot-aggregate-bonded-added.png){:width="800px"}

The sensor has cosigned the transaction automatically or sent a transfer transaction to your product.

2\. Go to the product detail page. Has the product passed the safety test?

![screenshot-product-detail-inspection-failed]({{ site.baseurl }}/assets/images/screenshot-product-detail-inspection-failed.png){:width="800px"}

3\. Repeat the process several times with different products, until one of them gets the safety seal.

![screenshot-product-detail-inspection-passed]({{ site.baseurl }}/assets/images/screenshot-product-detail-inspection-passed.png){:width="800px"}
