---
layout: post
title:  "Setup: Warehouse operator and safety seal"
permalink: /lessons/setup/
---

The creation of accounts and registration of the mosaic are **actions that are performed once**. For this kind of tasks, we normally use the **NEM2-CLI**.

## Creating the warehouse operator's account

1\. Open a terminal, and generate a new account.

{% highlight console %}
nem2-cli account generate

Introduce network type (MIJIN_TEST, MIJIN, MAIN_NET, TEST_NET): MIJIN_TEST
Do you want to save it? [y/n]: y
Introduce NEM 2 Node URL. (Example: http://localhost:3000): http://localhost:3000
Insert profile name (blank means default and it could overwrite the previous profile): operator
{% endhighlight %}

2\. Get the key pair and address.

{% highlight console %}
nem2-cli profile list
{% endhighlight %}


## Creating the company's account

Performing actions in the blockchain have a cost. This is necessary to provide an incentive for those who validate and secure the network. The fee is paid in **cat.currency**, the underlying cryptocurrency of the NEM network.

Instead of creating a new account, let's use an account which already has cat.currency. We will need it to register the namespace and mosaic.

1\. Open a terminal. Then go to the directory where you have download Catapult Bootstrap Service.

{% highlight console %}

cd  build/generated-addresses/
cat addresses.yaml

{% endhighlight %}

Under the section ``nemesis_addresses``, you will find the key pairs which contain cat.currency.

2\. Load the first account as a profile in NEM2-CLI. This account identifies the company.

{% highlight console %}
nem2-cli profile create

Introduce network type (MIJIN_TEST, MIJIN, MAIN_NET, TEST_NET): MIJIN_TEST
Introduce your private key: 41************************************************************FF
Introduce NEM 2 Node URL. (Example: http://localhost:3000): http://localhost:3000
Insert profile name (blank means default and it could overwrite the previous profile): company
{% endhighlight %}


## Create the safety seal mosaic

The company registers a mosaic representing the safety seal by announcing a [NamespaceTransaction](https://nemtech.github.io/guides/mosaic/creating-a-mosaic.html). Once announced the transaction, the server will return an OK response.

**Receiving an OK response does not mean that the transaction is valid, hence is is still not included in a block.** A good practice is to monitor transactions before announcing them.

1\. Open two new terminals. The first terminal monitors announced transactions **validation errors**.

{% highlight console %}
nem2-cli monitor status --profile company
{% endhighlight %}

Once a transaction is included in a block, you will see it under the **confirmed** terminal.

{% highlight console %}
nem2-cli monitor confirmed --profile company
{% endhighlight %}

2\. Create a new mosaic with a total ``supply`` of 1.000.000. Define it as ``transferable``, with ``divisibility`` 0 (without decimals). The ``supply mutable`` option allows you to increase or decrease the amount of this type of mosaics in the future.

{% highlight console %}
nem2-cli transaction mosaic --profile company

Do you want an eternal mosaic? [y/n]: y
Introduce mosaic divisibility: 0
Do you want mosaic to have supply mutable? [y/n]: y
Do you want mosaic to be transferable? [y/n]: y
Do you want mosaic to have levy mutable? [y/n]: n
Introduce amount of tokens: 1000000
{% endhighlight %}

3\. Did the network confirm the transaction? Check the opened terminals.

Once the mosaic has been registered, you can assign a name to the mosaic.

##  Assign a name to the mosaic

If everything went well, you should have the created mosaic identifier.

{% highlight console %}
Your mosaic id is:
Hex:  6b6e113a0d16adc9
Uint64: [ 219590089 1802375482]
{% endhighlight %}

The id ``6b6e113a0d16adc9`` is difficult to remember. Assigning a name to the mosaic, we will make it recognizable.

1\. Register the namespace ``company``, setting a lease duration expressed in blocks.

{% include note.html content="By default blocks complete every 15 seconds on average. 90000 blocks are 15,62 days approximately." %}

{% highlight console %}
nem2-cli transaction namespace  --profile company

Introduce namespace name: company
Do you want to create a root namespace? [y/n]: y
Introduce namespace rental duration: 90000
{% endhighlight %}

2\. Register the subnamespace ``company.safetyseal``:

{% highlight console %}
nem2-cli transaction namespace  --profile company

Introduce namespace name: safetyseal
Do you want to create a root namespace? [y/n]: n
Introduce the Parent name: company
{% endhighlight %}

3\. Link the namespace company.safetyseal to the mosaic.

{% highlight console %}
nem2-cli transaction mosaicalias --profile company

Introduce namespace name: company.safetyseal
Introduce mosaic in hexadecimal format: 6b6e113a0d16adc9
Introduce alias action (0: Link, 1: Unlink): 0
{% endhighlight %}


## Transfer company.safety seals to the operator account

Transfer 1.000 company.safety:seal and 1.000 cat.currency to the operator's account.

{% include note.html content="cat.currency has divisibility 6. 1.000 in absolute amount is written relativeAmount * 10^divisibility = 1000000000. " %}

{% highlight console %}
nem2-cli transaction transfer --profile company

Introduce the recipient address: SA56XXRVS7NG7UH3DTZEMRIVJJLDXXPKAYQAFT2S
Mosaic you want to get in the format (mosaicId(hex)|@aliasName)::absoluteAmount, (Ex: sending 1 cat.currency, @cat.currency::1000000). Add multiple mosaics with commas:
@company.safetyseal::1000,@cat.currency::1000000000
{% endhighlight %}
