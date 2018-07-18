---
layout: post
title:  "Adding another operator"
permalink: /lessons/adding-another-operator/
---

![use-case-nem-adding-operator]({{ site.baseurl }}/assets/images/use-case-nem-adding-operator.png)

Due to recent improvements in technology, the company has increased its productivity. As a result, another warehouse operator has been hired.

Although they could use the same account to send safety seals, the company requires to audit who has performed the action.

The company also inquires to apply conditional logic to the process: If one operator agrees to send the seal, the other one does not have to.

## Multisig Accounts

A NEM account can be converted to [multisig](https://nemtech.github.io/concepts/multisig-account.html). From that moment on, the account cannot announce transactions by itself, requiring other accounts to announce transactions for them. These other accounts are the multisig cosignatories.

Besides, it is not always necessary to force all cosignatories to cosign the transaction. NEM allows setting up the minimum number of cosignatories agreement. These properties can be edited afterwards to suit almost all needs.

Some important considerations to keep in mind:

* Once you convert an account to a multisig, you can no longer initiate transactions from that account. Only the cosignatories can initiate transactions for the account.
* NEM’s current implementation of multisig is “M-of-N”, meaning M can be any number equal to or less than N, i.e., 1-of-4, 2-of-2, 4-of-9, 9-of-10 and so on.
* Multisig accounts can have up to ``10`` cosignatories.
* An account can be cosigner of up to ``5`` multisig accounts.
* The number of minimum cosignatures to approve transactions and remove cosignatories is editable.
* Multisig accounts can have as a cosigner another multisig, up to ``3`` levels.

## Solution

### New Actor: Warehouse Operator 2

Create an account for the new warehouse operator

{% highlight bash %}
  nem2-cli account generate --network MIJIN_TEST --url http://localhost:3000 --profile operator2 --save 
{% endhighlight %}

### Safety Department and Warehouse: Multisig Accounts

Create two accounts to represent the warehouse and the safety department.

You are going to implement the ``Multisig Service``, available at the top-right side of the navbar.

![screenshot-multisig-service]({{ site.baseurl }}/assets/images/screenshot-multisig-service.png)

Open ``project/dashboard/src/app/services/multisig.service.ts`` and find ``createMultisig`` function.

Replace the alert with the following code:

{% highlight typescript %}
  
  createMultisig(account: Account, minApproval: number, cosignatories: PublicAccount[]) : SignedTransaction {

    const modifications = cosignatories.map(cosignatory => {
      return new MultisigCosignatoryModification(
        MultisigCosignatoryModificationType.Add,
        cosignatory,
      );
    });

    const createMultisigTransaction = ModifyMultisigAccountTransaction.create(
      Deadline.create(),
      minApproval,
      1,
      modifications,
      NetworkType.MIJIN_TEST);

    return account.sign(createMultisigTransaction);
  }

{% endhighlight %}

We are creating a ``ModifyMultisigAccountTransaction``, setting the ``minApproval`` passed by parameter, and the list of cosignatories as  ``MultisigCosignatoryModification``.

Go back to the dashboard, and convert the **warehouse** account to a  1-of-2 multisig. Set the **warehouse operators 1 and 2 as cosignatories**.

![screenshot-multisig-service-warehouse]({{ site.baseurl }}/assets/images/screenshot-multisig-service-warehouse.png)

Then, convert the **safety department's** account to a 2-of-2 multisig.  Set the **warehouse's and sensor's accounts as cosignatories**.

![screenshot-multisig-service-company]({{ site.baseurl }}/assets/images/screenshot-multisig-service-safety-department.png)

Load ``safety deparment`` account with 1.000 ``company.safety:seal``.

{% highlight bash %}
$> nem2-cli transaction transfer --profile company
Introduce the recipient address: SCSG23-J2BVLU-S4JA4N-ZKMYKV-JR5LTK-M76KJ7-Q2V3
Introduce the mosaics in the format namespaceName:mosaicName::absoluteAmount, add multiple mosaics splitting them with a comma:
> company.safety:seal::1000

{% endhighlight %}

### Modify aggregate transaction

Open ``project/dashboard/src/app/services/safetySeal.service.ts``, and find ``transferSafetySeal`` function.

Add ``safety deparment`` public account as the required signed of the aggregate bonded transaction.

Only the accounts that are not multisig accounts can announce and cosign transactions. For that reason, we opt to announce it with the operator's account.

{% highlight typescript %}
  
  transferSafetySeal(productAddress: Address, operatorAccount: Account) : SignedTransaction {
    
    const safetyDeparmentAccountPublicKey = ''; //TODO: Paste company account public key
    const safetyDeparmentPublicAccount = PublicAccount.createFromPublicKey(safetyDeparmentAccountPublicKey, NetworkType.MIJIN_TEST);

    const safetyDepartmentToProductTransaction = TransferTransaction.create(
      Deadline.create(),
      productAddress,
      [new Mosaic(new MosaicId('company.safety:seal'), UInt64.fromUint(1))],
      EmptyMessage,
      NetworkType.MIJIN_TEST
    );

    const aggregateTransaction = AggregateTransaction.createBonded(
      Deadline.create(),
      [safetyDepartmentToProductTransaction.toAggregate(safetyDeparmentPublicAccount)],
      NetworkType.MIJIN_TEST);

    return operatorAccount.sign(aggregateTransaction);
  }
{% endhighlight %}

The sensor must listen to the aggregate bonded transactions pending to be signed from the safety department's account.

Open ``project/server/.env``, and add the safety department's address.

{% highlight bash %}
SAFETY_DEPARTMENT_ADDRESS='SCSG23-J2BVLU-S4JA4N-ZKMYKV-JR5LTK-M76KJ7-Q2V3'
{% endhighlight %}

Restart the server to apply the changes.

## Testing your changes

Send a Safety Seal.

Go to the product detail page. Has the product passed the safety test?

Repeat the process several times with different products, until one of them gets the safety seal.