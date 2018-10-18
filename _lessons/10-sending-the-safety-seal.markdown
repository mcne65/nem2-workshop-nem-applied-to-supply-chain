---
layout: post
title:  "Sending the safety seal"
permalink: /lessons/sending-the-safety-seal/
---

## Background

Assume that the operator has tested the product thoroughly, determining it should have the company's safety seal.

Implementing this process consists of:

1) Creating a Transfer Transaction, adding one company.safety:seal.

2) Signing the Transfer Transaction with the operator's account.

3) Announcing the Transfer Transaction.

![use-case-nem]({{ site.baseurl }}/assets/images/use-case-nem.png)

We are interested in tracking who has sent the seal. For that reason, we will announce the transaction directly from the web app, signing it with the operator account.

## Solution

1\. Open ``Send Safety Seal`` tab and try click the button: you will get an error. The triggered function has not been developed yet. 
 
![send-safety-seal]({{ site.baseurl }}/assets/images/screenshot-send-safety-seal.png)

2\. Open ``project/dashboard/src/app/services/safetySeal.service.ts``, and find ``createSafetySealTransaction`` function.

In the previous module, you have already sent a transfer transaction, but didn't see its implementation.
 
3\. Create a transfer transaction.
 
* **Deadline**: How many blocks can pass before the transaction has to be included in a block.
* **Recipient**: product address.
* **Mosaics**: 1 company.safety:seal.
* **Network**: In this exercise, we are using MIJIN_TESTNET.

{% highlight typescript %}
createSafetySealTransaction(productAddress: Address): TransferTransaction {

    return TransferTransaction.create(
      Deadline.create(),
      productAddress,
      [new Mosaic(new MosaicId('company.safety:seal'), UInt64.fromUint(1))],
      EmptyMessage,
      NetworkType.MIJIN_TEST
    );
}
{% endhighlight %}

## Testing your changes
  
4\. Save your changes. Now, you can press ``Confirm Safety Seal`` button.

If valid, the transaction reaches the network with an **unconfirmed status**.

![screenshot-unconfirmed-added]({{ site.baseurl }}/assets/images/screenshot-unconfirmed-added.png)

    Never rely on a transaction which has the state unconfirmed. It is not clear if it will get included in a block.

The transaction is **confirmed** once it is included in a block. The transaction is **confirmed** once it is included in a block. In case of a transfer transaction, the amount stated gets transferred from the sender’s account to the recipient’s account.

![screenshot-confirmed-transaction]({{ site.baseurl }}/assets/images/screenshot-confirmed.png)

If the transfer transaction announced has some validation error, you will get noticed under ``Status Error`` section. Open [Error description](https://nemtech.github.io/api/websockets.html) to discover what the error means.

![screenshot-status-error]({{ site.baseurl }}/assets/images/screenshot-status-error.png)

5\. Go back to ``Create Product`` tab and open the product you have sent the safety seal to. Check that the product has the mosaic:

![screenshot-product-detail-seal]({{ site.baseurl }}/assets/images/screenshot-product-detail-seal.png)

## What's next

Congratulations, you have finished the proposed use case! In the next modules, we are going to add some modifications to our solution, using new NEM built-in features.