---
layout: post
title:  "Adding another operator"
permalink: /lessons/adding-another-operator/
---

## Background

Due to recent improvements in technology, the company has increased its productivity. As a result, another warehouse operator has been hired.

Although they could use the same account to send safety seals, the company requires to audit who has performed the action.

The company also inquires to apply conditional logic to the process: If one operator agrees to send the seal, the other one does not have to.

![use-case-nem-adding-operator]({{ site.baseurl }}/assets/images/use-case-nem-adding-operator.png)

### Multisig Accounts


NEM allows the creation of **[multisignature accounts](https://nemtech.github.io/concepts/multisig-account.html)**. From that moment on, this  cannot announce transactions by itself. It requires other accounts, called cosignatories, to announce the transactions for them.

It is not always necessary to force all cosignatories to cosign the transaction. The contract is set up specifying the minimum number of cosignatories agreement. These properties can be edited afterwards to suit almost all needs.

Some important considerations to keep in mind:

* Once you convert an account to a multisig, you can no longer initiate transactions from that account. Only the cosignatories can start transactions for  the multisig account.
* NEM’s current implementation of multisig is **“M-of-N”**, meaning M can be any number equal to or less than N, i.e., 1-of-4, 2-of-2, 4-of-9, 9-of-10 and so on.
* Multisig accounts can have up to 10 cosignatories.
* An account can be cosigner of up to 5 multisig accounts.
* The number of smallest cosignatures to approve transactions and remove cosignatories is **editable**.
* Multisig accounts can have another multisig as a cosigner, up to 3 levels.

## Solution

### New Actor: Warehouse Operator 2

Create an account for the new warehouse operator

{% highlight bash %}
  nem2-cli account generate --network MIJIN_TEST --url http://localhost:3000 --profile operator2 --save 
{% endhighlight %}

### Safety Department and Warehouse: Multisig Accounts

1\.Create two accounts to represent the warehouse and the safety department.

You are going to implement the ``Multisig Service``, available at the top-right side of the navbar.

![screenshot-multisig-service]({{ site.baseurl }}/assets/images/screenshot-multisig-service.png)

2\. Open ``project/dashboard/src/app/services/multisig.service.ts`` and find ``createMultisig`` function.

3\. Replace the alert with the following code:

{% highlight typescript %}
createMultisigAccountTransaction(multisigCandidate: PublicAccount,
                               minApproval: number,
                               minRemoval: number,
                               cosignatories: PublicAccount[]): AggregateTransaction {

    const newCosignatories = cosignatories.map( cosignatory => {
      const publicAccount = PublicAccount.createFromPublicKey(cosignatory.publicKey, NetworkType.MIJIN_TEST);
      return new MultisigCosignatoryModification(MultisigCosignatoryModificationType.Add, publicAccount);
    });
    
    const modifyMultisigAccountTransaction = ModifyMultisigAccountTransaction.create(
      Deadline.create(),
      minApproval,
      minRemoval,
      newCosignatories,
      NetworkType.MIJIN_TEST);
    
    return AggregateTransaction.createComplete(
      Deadline.create(),
      [modifyMultisigAccountTransaction.toAggregate(multisigCandidate)],
      NetworkType.MIJIN_TEST,
      []);
}
{% endhighlight %}

We are creating a ``ModifyMultisigAccountTransaction``, setting the ``minApproval`` passed by parameter, and the list of cosignatories as  ``MultisigCosignatoryModification``.

4\. Go back to the dashboard, and convert the **warehouse** account to a  1-of-2 multisig. Set the **warehouse operators 1 and 2 as cosignatories**.

![screenshot-multisig-service-warehouse]({{ site.baseurl }}/assets/images/screenshot-multisig-service-warehouse.png)

5\. Then, convert the **safety department's** account to a 2-of-2 multisig.  Set the **warehouse's and sensor's accounts as cosignatories**.

![screenshot-multisig-service-company]({{ site.baseurl }}/assets/images/screenshot-multisig-service-safety-department.png)

6\. Load ``safety deparment`` account with 1.000 ``company.safety:seal``.

{% highlight bash %}
$> nem2-cli transaction transfer --profile company
Introduce the recipient address: SCSG23-J2BVLU-S4JA4N-ZKMYKV-JR5LTK-M76KJ7-Q2V3
Introduce the mosaics in the format namespaceName:mosaicName::absoluteAmount, add multiple mosaics splitting them with a comma:
> company.safety:seal::1000

{% endhighlight %}

### Modify aggregate transaction

1\. Open ``project/dashboard/src/app/services/safetySeal.service.ts``, and find ``createSafetySealTransaction`` function.

2\. Add ``safety deparment`` public account as the required signer of the aggregate bonded transaction.

Only the accounts that are not multisig accounts can announce and cosign transactions. For that reason, we opt to announce it with the operator's account.

{% highlight typescript %}
createSafetySealTransaction(productAddress: Address, operatorAccount: PublicAccount): AggregateTransaction {

    const safetyDeparmentAccountPublicKey = ''; // Todo: Paste company account public key
    const safetyDeparmentPublicAccount = PublicAccount.createFromPublicKey(safetyDeparmentAccountPublicKey, NetworkType.MIJIN_TEST);

    const safetyDepartmentToProductTransaction = TransferTransaction.create(
      Deadline.create(),
      productAddress,
      [new Mosaic(new MosaicId('company.safety:seal'), UInt64.fromUint(1))],
      EmptyMessage,
      NetworkType.MIJIN_TEST
    );

    return AggregateTransaction.createBonded(
      Deadline.create(),
      [safetyDepartmentToProductTransaction.toAggregate(safetyDeparmentPublicAccount)],
      NetworkType.MIJIN_TEST);
}
{% endhighlight %}

3\. Open ``project/server/.env``, and add the safety department's address.

{% highlight bash %}
SAFETY_DEPARTMENT_ADDRESS='SCSG23-J2BVLU-S4JA4N-ZKMYKV-JR5LTK-M76KJ7-Q2V3'
{% endhighlight %}

This is required because the sensor listens  the aggregate bonded transactions pending to be signed.

## Testing your changes

1\. Restart the server to apply the changes.

2\. Send a Safety Seal.

3\. Go to the product detail page. Has the product passed the safety test? Repeat the process several times with different products, until one of them gets the safety seal.
