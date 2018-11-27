---
layout: post
title:  "Data modelling"
permalink: /lessons/data-modelling/
---

The blockchain is a disrupting technology. Existent businesses can find it difficult to  replace their existing core processes. Even startups and new companies could have problems defining large scope decentralised applications.

When developing software, it is common to use **different technologies**.

There are specific things we could solve efficiently using NEM blockchain. For some others, use relational and non-relational databases altogether, or distributed storage system like IPFS.

This module explains a subset of built-in features available in NEM blockchain. Take a few minutes to read about them, thinking about how to use them in the system we previously designed.

## Account

![account]({{ site.baseurl }}/assets/images/concept-account.png)

An [account](https://nemtech.github.io/concepts/account.html) is a key pair (private and public key) associated to a mutable state stored on the NEM blockchain. Simply put, you have a deposit box in the blockchain, which only you can modify with your key pair. As the name suggests, the private key has to be kept secret at all times. Anyone with access to the private key, ultimately has control over the account.

Consider NEM accounts as containers for assets in the blockchain. An account could represent something as simply as a user's account full of coins, like most blockchains. But it could also represent a single object that must be unique and updatable: a package to be shipped, a deed to a house, or a document to be notarized.

## Namespace & Mosaics

![mosaic]({{ site.baseurl }}/assets/images/concept-mosaic.png)

[Namespaces](https://nemtech.github.io/concepts/namespace.html) allow you to create an on-chain unique place for your business and your assets on the NEM blockchain. A namespace starts with a name that you choose, similar to an internet domain name.

After registering your namespace, you can define subnamespaces, as well as your mosaics.

[Mosaics](https://nemtech.github.io/concepts/mosaic.html) are part of what makes the Smart Asset System different and flexible. They are fixed assets on the NEM blockchain that can represent a set of multiple identical things that do not change. A mosaic could be a token, but it could also represent a collection of more specialised assets like reward points, shares of stock, signatures, status flags, votes or even other currencies.
                                                                                                                                                                                                 
## Transfer Transaction

![transfer-transaction]({{ site.baseurl }}/assets/images/concept-transfer.png)

[Transfer transactions](https://nemtech.github.io/concepts/transfer-transaction.html) are used to send mosaics between two accounts. They can hold messages up to 1024 characters.