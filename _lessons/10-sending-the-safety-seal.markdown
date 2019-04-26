---
layout: post
title:  "Sending the safety seal"
permalink: /lessons/sending-the-safety-seal/
---

## Background

Assume that the operator has tested the product thoroughly, determining it should have the company's safety seal.

Implementing this process consists of:

1) Creating a TransferTransaction, adding one company.safetyseal.

2) Signing the TransferTransaction with the operator's account.

3) Announcing the TransferTransaction.

![use-case-nem]({{ site.baseurl }}/assets/images/use-case-nem.png){:width="500px"}

We are interested in tracking who has sent the seal. For that reason, we will announce the transaction directly from the web app, signing it with the operator account.

## Instructions

1\. Open ``Send Safety Seal`` tab and try to send a seal: you will get an error. The triggered function has not been developed yet. 
 
![send-safety-seal]({{ site.baseurl }}/assets/images/screenshot-send-safety-seal.png){:width="800px"}

2\. Open ``project/dashboard/src/app/services/safetySeal.service.ts``, and find ``createSafetySealTransaction`` function.
 
3\. Complete ``createSafetySealTransaction`` with the following transfer transaction.
 
* **Deadline**: How many blocks can pass before the transaction has to be included in a block.
* **Recipient**: product address.
* **Mosaics**: 1 company.safetyseal.
* **Network**: In this exercise, we are using MIJIN_TESTNET.

{% highlight typescript %}
createSafetySealTransaction(productAddress: Address): TransferTransaction {

    return TransferTransaction.create(
      Deadline.create(),
      productAddress,
      [new Mosaic(new NamespaceId('company.safetyseal'), UInt64.fromUint(1))],
      EmptyMessage,
      NetworkType.MIJIN_TEST
    );
}
{% endhighlight %}

4\. Save your changes.

## Testing your changes
  
1\. Go back to the dashboard, select a product, and press ``Confirm Safety Seal`` button.

If valid, the transaction reaches the network with an **unconfirmed status**.

![screenshot-unconfirmed-added]({{ site.baseurl }}/assets/images/screenshot-unconfirmed-added.png){:width="800px"}

{% include note.html content="Never rely on a transaction which has the state unconfirmed. It is not clear if it will get included in a block." %}

The transaction is **confirmed** once it is included in a block. In case of a transfer transaction, the amount stated gets transferred from the sender’s account to the recipient’s account.

![screenshot-confirmed-transaction]({{ site.baseurl }}/assets/images/screenshot-confirmed.png){:width="800px"}

If the transfer transaction announced has some validation error, you will get noticed under ``Status Error`` section. Open [Error description](https://nemtech.github.io/api/websockets.html) to discover what the error means.

![screenshot-status-error]({{ site.baseurl }}/assets/images/screenshot-status-error.png){:width="800px"}

2\. Go back to ``Create Product`` tab and find the product you have sent the safety seal.

![screenshot-product-detail-seal]({{ site.baseurl }}/assets/images/screenshot-product-detail-seal.png){:width="800px"}

3\. Check that the product has the mosaic attached.

## What's next?

Congratulations, you have finished the proposed use case! In the next modules, we are going to add some modifications to our solution, using new NEM built-in features.
