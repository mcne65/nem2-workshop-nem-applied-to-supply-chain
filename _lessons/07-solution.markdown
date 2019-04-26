---
layout: post
title:  "One possible solution"
permalink: /lessons/solution/
---

## Architecture
NEM features are available through the API interface on each node in the network itself. This allows using blockchain technology in a **variety of solution architectures**.

Where are you going to use blockchain? Spend some minutes thinking about how you would architecture the solution.  

Here you can see one possible solution:

![solution]({{ site.baseurl }}/assets/images/solution.png){:width="550px"}

The warehouse operator will interact through a **web app**. 

The app interfaces with the **company's servers**, where all the products are stored in an **existent SQL database**. 

The app also connects with **NEM blockchain**, sending transactions from the client side.

## Where are we using NEM?

Think about how you can combine the different built-in features to solve the use case.
![use-case-nem]({{ site.baseurl }}/assets/images/use-case-nem.png){:width="500px"}

We have decided to represent **products** and the **warehouse operator** as **accounts**. 

**Products**

Products are assets: an object that has a value, which is unique and updatable and owned by someone.

Accounts can be used to represent assets, identifying each product uniquely and gathering the history of transactions and mosaics sent.

Any actor could trace events related to a product by checking its address. 

Product accounts don't need to send transactions, they only receive them. To guarantee none of them sign transactions, we are generating each public key in a deterministic way. Generate a hash that represents the public key, not knowing the private key related.

*publicKey = sha256(company_identifier + product_identifier)*

By doing this, if the database references are lost, the product information will still be retrievable from the blockchain. The address can be generated again providing the company and product's identifier.

**Warehouse operator**

As if it were an ID card, an account identifies and allows the warehouse operator to make transactions.

**Safety seal**

The **safety seal** is represented with a **namespace, a subnamespace and a mosaic alias** assigned to this set. A namespace identifies the company, and a subnamespace the use-case. The mosaic ``company.safetyseal`` represents the safety seals. 

We could opt to set ``transferable`` property to false. This would prevent transferring the mosaic to other accounts once sent. However, as we are not saving the products' private keys, there is no risk of the seals being moved once sent to a product.

Who will be the owner of this namespace and mosaic? At first glance, it may seem that the warehouse operator's account is the one. However, the warehouse operator could stop working for this company. For that reason, we will create a new **company** account to register this mosaic and namespace.

The **Company** sends some mosaics to the **warehouse operator** account. 

The warehouse operator sends a **transfer transaction** to the product, with ``1 company.safetyseal mosaic``.
