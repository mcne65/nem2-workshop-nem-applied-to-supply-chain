---
layout: post
title:  "Sending the safety seal"
permalink: /lessons/sending-the-safety-seal/
---

Assume that the operator has tested the product thoroughly, determining it should have the company's safety seal.

Implementing this process consists of:

1) Creating a Transfer Transaction, adding one company.safety:seal.

2) Signing the Transfer Transaction with the operator's account.

3) Announcing the Transfer Transaction.

![send-safety-seal]({{ site.baseurl }}/assets/images/screenshot-send-safety-seal.png)

Click on the ``Send Safety Seal`` button: you will get an error. The triggered function has not been developed yet. 
 
Open ``project/dashboard/src/app/services/safetySeal.service.ts``, and find ``transferSafetySeal`` function.

In the previous module, you have already sent a transaction, but didn't see its implementation.
 
Create a transfer transaction, set the ``productAddress`` as the recipient, and add the mosaic ``company.safety:seal`` with amount ``1`` to the mosaics array.

{% highlight typescript %}
  transferSafetySeal(productAddress: Address, operatorAccount: Account) : SignedTransaction {
    
    // Create transfer transaction
    const transferTransaction = TransferTransaction.create(
      Deadline.create(),
      productAddress,
      [new Mosaic(new MosaicId('company.safety:seal'), UInt64.fromUint(1))],
      EmptyMessage,
      NetworkType.MIJIN_TEST
    );
    
    // Sign transfer transaction with operator account
    return operatorAccount.sign(transferTransaction);
  }

{% endhighlight %}

## Testing your changes
  
Save your changes. Now, you can press ``Confirm Safety Seal`` button.

If valid, the transaction reaches the network with an **unconfirmed status**.

![screenshot-unconfirmed-added]({{ site.baseurl }}/assets/images/screenshot-unconfirmed-added.png)

    Never rely on a transaction which has the state unconfirmed. It is not clear if it will get included in a block.

The transaction is **confirmed** once it is included in a block. In case of a transfer transaction, the transaction gets processed and the amount stated gets transferred from the sender’s account to the recipient’s account.

![screenshot-confirmed-transaction]({{ site.baseurl }}/assets/images/screenshot-confirmed.png)

If the transfer transaction you have announced has some validation error, you will get noticed under ``Status Error`` section. Open [Error description](https://nemtech.github.io/api/websockets.html) to discover what the error means.

![screenshot-status-error]({{ site.baseurl }}/assets/images/screenshot-status-error.png)

Go back to ``Create Product`` tab and open the product you have sent the safety seal to. Check that the product has the mosaic:

![screenshot-product-detail-seal]({{ site.baseurl }}/assets/images/screenshot-product-detail-seal.png)

## What's next

Congratulations, you have finished the proposed use case! In the next modules, we are going to add some modifications to our solution, using new NEM built-in features.