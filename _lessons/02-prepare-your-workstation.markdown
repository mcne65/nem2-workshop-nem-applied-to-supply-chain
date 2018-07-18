---
layout: post
title:  "Prepare your workstation"
permalink: /lessons/prepare-your-workstation/
---

![4-layered-architecture]({{ site.baseurl }}/assets/images/four-layer-architecture.png)

## Running Catapult Service Bootstrap

**Catapult Server nodes** (layer 1) build the peer-to-peer blockchain network. **Catapult Rest nodes** (layer 2) provide the API gateway that the applications may use to access the blockchain and its features.

You are going to **run a private chain** for learning purposes using [Catapult Service Bootstrap](https://github.com/tech-bureau/catapult-service-bootstrap) in less than 5 minutes. This service runs Catapult server instances and Catapult REST nodes locally.

Make sure you have [docker](https://docs.docker.com/install/) and [docker compose](https://docs.docker.com/compose/install/) installed before running the following commands:

{% highlight bash %}
git clone https://github.com/tech-bureau/catapult-service-bootstrap
cd catapult-service-bootstrap
docker-compose up
{% endhighlight %}

After the image has been downloaded and the service is running, check if you can get the first block information:

{% highlight bash %}
curl localhost:3000/block/1
{% endhighlight %}


## Downloading the project files
This workshop is project based. We are going to add some new features to an existing project.

Download the workshop repository.

{% highlight bash %}
git clone <url>
{% endhighlight %}

Under ``project`` folder, there is a ``dashboard`` and a small ``server``  using Express. Both of them have installed the **NEM2 Software Development Kit** (layer 3). NEM2-SDK is the primary software development tool to create NEM2 components, such as other tools, libraries or applications.

During this workshop, we are going to use the **Typescript SDK**.

Install **typescript** globally. 

{% highlight bash %}
npm install -g typescript <url>
{% endhighlight %}

Run the ``server``.

{% highlight bash %}
cd <name>/project/server
npm install
npm start
{% endhighlight %}

Open a new terminal, and run the ``dashboard``.

{% highlight bash %}
cd <name>/project/dasbhoard
npm install
npm start
{% endhighlight %}

## Installing NEM2-CLI

**NEM2-CLI** conveniently allows you to perform the most commonly used commands from your terminal i.e. using it to interact with the blockchain, setting up and account, sending funds, etc.


Install **nem2-cli** using npm.

{% highlight bash %}
npm i -g nem2-cli
{% endhighlight %}
