---
layout: post
title:  "Authorisation modelling"
permalink: /lessons/authorisation-modelling/
---

## Who and how?

At this point, we are not going to think about which specific technologies or programming languages we are going to use to fit our objectives. 

Before starting developing, it is time to define who is allowed to do what, closing the gap between the physical and digital world. 

* [Entity-Control-Boundary Pattern](http://www.cs.sjsu.edu/~pearce/modules/patterns/enterprise/ecb/ecb.htm)

![use-case]({{ site.baseurl }}/assets/images/create-product.png)

![use-case]({{ site.baseurl }}/assets/images/send-safety-seal.png)

**Actors**: Identities who will be interacting with the system we are building.

* Warehouse operator.

**Boundaries**: How these actors interact with the system. The warehouse communicates with the system using an operator panel. 

**Entities**: The data models we should represent in our system.

* The product
* The safety seal

**Controllers**: Each actor triggers actions that will perform changes to the entities.

* **Create product**: Save a new product in the system.

* **Send safety seal**: After checking that the product passes the manual safety control, the operator sends a safety seal.

The next module shows you how to map entities and actors with NEM Smart Assets System.

