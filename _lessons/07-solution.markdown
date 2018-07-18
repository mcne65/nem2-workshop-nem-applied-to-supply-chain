---
layout: post
title:  "One possible solution"
permalink: /lessons/solution/
---

## Architecture
NEM features are available through the API interface on each node in the network itself. Blockchain technology can be used to create a **variety of solution architectures** with light-weight code in any language.

One possible solution for our use case:

![solution]({{ site.baseurl }}/assets/images/solution.png)

The warehouse operator interacts through a **web app**. This web app interfaces with the **company's servers**, where all the products are tracked in an **existent SQL database**.The same web app directly connects with **NEM blockchain**, sending transactions from the client side.

## Where are we using NEM?

![use-case-nem]({{ site.baseurl }}/assets/images/use-case-nem.png)

We have decided to represent **products** and the **warehouse operator** as **accounts**. 

**Products**

Products are assets: an object that has a value, which is unique and updatable and owned by someone.

Accounts can be used to represent assets, identifying each product uniquely and gathering the history of transactions and mosaics sent.

Any actor could trace events related to a product by checking its address. 

Product accounts don't need to send transactions, they only receive them. To guarantee none of them sign transactions, we are generating each public key in a deterministic way.

*publicKey = sha256(company_identifier + product_identifier)*

By doing this, if the database references are lost, or someone with access to our private network wants to review product information, just providing the company and product's identifier, the address can be generated again getting the product stored information.

**Warehouse operator**

As if it were an ID card, an account identifies and allows the warehouse operator to make transactions.

**Safety seal**

The **safety seal** is represented with a **namespace, a subnamespace and a mosaic**. A namespace identifies the company, and a subnamespace the division. The mosaic ``company.safety:seal`` represents the safety seals. 

We could opt to set ``transferable`` property to false. This would prevent transferring the mosaic to other accounts once sent. However, as we are not saving the products' private keys, there is no risk of the seals being moved once sent to a product.

Who will be the owner of this namespace and mosaic? At first glance, it may seem that the warehouse operator's account is the one. However, the warehouse operator could stop working for this company. For that reason, we will create a new **company** account to register this mosaic and namespace.

The **Company** sends some mosaics to the **warehouse operator** account. 

The warehouse operator sends a **transfer transaction** to the product, with ``1 company.safety:seal mosaic``.