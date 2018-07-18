---
layout: post
title:  "Setup: Warehouse operator and safety seal"
permalink: /lessons/setup/
---

The creation of the company's, warehouse operator's account and registration of the mosaic are **actions that are performed once**. For this kind of tasks, we normally use the **NEM2-CLI**.

## Creating warehouse operator's account

Open a terminal, and generate a new account.

{% highlight bash %}
$> nem2-cli account generate
Introduce network type (MIJIN_TEST, MIJIN, MAIN_NET, TEST_NET): MIJIN_TEST
Do you want to save it? [y/n]: y
Introduce NEM 2 Node URL. (Example: http://localhost:3000): http://localhost:3000
Insert profile name (blank means default and it could overwrite the previous profile): operator
{% endhighlight %}

Get the warehouse operator's account's key pair and address.

{% highlight bash %}
$> nem2-cli profile list
{% endhighlight %}


## Creating company's account

Performing actions in the blockchain have a cost. This is necessary to provide an incentive for those who validate and secure the network. The fee is paid in **XEM**, the underlying cryptocurrency of the NEM network.

    ℹ️ In a private network, you could set transaction fees to 0.

Instead of creating a new account, let's use an account which already has XEM. We will need it to register the namespace and mosaic.

Open a terminal, and go to the directory where you have download Catapult Bootstrap Service.

{% highlight bash %}

$> cd  build/generated-addresses/
$> cat addresses.yaml

{% endhighlight %}

Under the section ``nemesis_addresses``, you will find the key pairs which contain XEM.


Load the first account as a profile in NEM2-CLI. This account identifies the company.

{% highlight bash %}
$> nem2-cli profile create

Introduce network type (MIJIN_TEST, MIJIN, MAIN_NET, TEST_NET): MIJIN_TEST
Introduce your private key: 41************************************************************FF
Introduce NEM 2 Node URL. (Example: http://localhost:3000): http://localhost:3000
Insert profile name (blank means default and it could overwrite the previous profile): company

{% endhighlight %}

##  Register company's namespace 

The company registers the namespace by announcing a [RegisterNamespaceTransaction](https://nemtech.github.io/guides/namespace/registering-a-namespace.html). Once announced the transaction, the server will return an OK response.

**Receiving an OK response doesn’t mean the transaction is valid, hence is is still not included in a block.** A good practice is to monitor transactions before announcing them.

We suggest opening two new terminals. The first terminal monitors announced transactions **validation errors**.

{% highlight bash %}
$> nem2-cli monitor status --profile company
{% endhighlight %}

Once a transaction is included in a block, you will see it under the **confirmed** terminal.

{% highlight bash %}
$> nem2-cli monitor confirmed --profile company
{% endhighlight %}

Register the namespace ``company``, setting a lease duration expressed in blocks.

    ℹ️ By default blocks complete every 15 seconds on average. 90000 blocks are 15,62 days approximately. 

{% highlight bash %}
$> nem2-cli transaction namespace --name company --rootnamespace --duration 90000 --profile company
{% endhighlight %}

Did the network confirm the transaction? Check the opened terminals.

##  Register company.safety subnamespace

Once the company's namespace has been registered, you can create related subnamespaces.

Register the subnamespace ``company.safety``:

{% highlight bash %}
$> nem2-cli  transaction namespace --name safety --subnamespace  --parentname company --profile company
{% endhighlight %}

## Create company.safety:seal mosaic

The mosaic name is ``seal`` and the parent namespace ``company.safety``.  Create it with a total ``supply`` of 1.000.000.

Define this mosaic as ``transferable``, with ``divisibility`` 0 (without decimals) and with ``lease duration`` of 90000 blocks. ``supply mutable`` option allows you to increase or decrease the amount of this type of mosaics in the future.

{% highlight bash %}
$> nem2-cli transaction mosaic --mosaicname seal --namespacename company.safety --amount 1000000 --transferable --supplymutable --divisibility 0 --duration 90000 --profile company
{% endhighlight %}

Transfer 1.000 company.safety:seal to operator's account.

{% highlight bash %}
$> nem2-cli transaction transfer --profile company
Introduce the recipient address: SA56XXRVS7NG7UH3DTZEMRIVJJLDXXPKAYQAFT2S
Introduce the mosaics in the format namespaceName:mosaicName::absoluteAmount, add multiple mosaics splitting them with a comma:
> company.safety:seal::1000

{% endhighlight %}
