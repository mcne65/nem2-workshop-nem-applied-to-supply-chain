---
layout: post
title:  "Data modeling"
permalink: /lessons/data-modelling/
---

The blockchain is a disrupting technology. Existent businesses can find it difficult to replace their existing core processes. Even startups and new companies could have problems defining decentralized applications with a large scope.

When developing software, it is common to use **different technologies**.

There are specific things we could solve efficiently using NEM blockchain. For some others, we will keep using relational and non-relational databases altogether, or distributed storage system like IPFS.

This module explains a subset of built-in features available in NEM blockchain. Take a few minutes to read about them, thinking about how to use them in the system we previously designed.

## Account

![account]({{ site.baseurl }}/assets/images/concept-account.png){:width="600px"}

An [account](https://nemtech.github.io/concepts/account.html) is a key pair (private and public key) associated with a mutable state stored on the NEM blockchain. In other words, you have a deposit box in the blockchain, which only you can modify with your key pair. 

{% include note.html content="As the name suggests, the private key has to be kept secret at all times. Anyone with access to the private key ultimately has control over the account." %}

NEM accounts are also containers of assets. An account could represent a user's account full of coins, like most blockchains. But it could also represent a single object that must be unique and updatable: a package to be shipped, a deed to a house, or a document to be notarized.

## Namespace & Mosaics

![mosaic]({{ site.baseurl }}/assets/images/namespace-tickets.png){:width="500px"}

[Namespaces](https://nemtech.github.io/concepts/namespace.html) allow you to create an on-chain unique place for your business and your assets on the NEM blockchain. A namespace starts with a name that you choose, similar to an internet domain name.

After registering your namespace, you can define subnamespaces. Next to this you can create mosaics. To make them easily identifiable, you can assign the namespace or subnamespace name to the mosaic. We call the (sub)namespace in this case alias.

[Mosaics](https://nemtech.github.io/concepts/mosaic.html) are part of what makes the Smart Asset System different and flexible. They are fixed assets on the NEM blockchain that can represent a set of multiple identical things that do not change. A mosaic could be a token, but it could also represent a collection of more specialized assets like reward points, shares of stock, signatures, status flags, votes or even other currencies.
                                                                                                                                                                                                 
## Transfer Transaction

![transfer-transaction]({{ site.baseurl }}/assets/images/concept-transfer.png){:width="600px"}

[Transfer transactions](https://nemtech.github.io/concepts/transfer-transaction.html) are used to send mosaics between two accounts. You can use them as well to share messages between two accounts.
