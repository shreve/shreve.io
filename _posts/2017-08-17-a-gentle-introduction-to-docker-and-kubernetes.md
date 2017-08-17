---
layout: post
title: A Gentle Introduction to Docker and Kubernetes
date: 2017-08-17
tags: devops beginners-guide
description: Get introduced to the concepts at play in the Kubernetes ecosystem to begin your journey to devops bliss
image: http://i.imgur.com/rbKYmlV.png
---

I've spent many years doing manual developer operations work.
At my current job, we have several servers that were all set up at different times running the same application.
Fixing stuff on one server meant it would need to be fixed on the others.
Sometimes one server is missing an OS dependency others weren't.
I've tried tools like capistrano, puppet, and chef, but they don't solve the whole problem, and they honestly felt quite brittle.
There has to be A Better Way&trade;.

This is why I found Kubernetes. I like this solution a lot, and it seems others do too: [GitHub](https://githubengineering.com/kubernetes-at-github/), [The New York Times](https://www.youtube.com/watch?v=P5qfyv_zGcU), and even [Pokemon GO](https://cloudplatform.googleblog.com/2016/09/bringing-Pokemon-GO-to-life-on-Google-Cloud.html) all run on Kubernetes. It's a great tool for a web service that's meant to scale, or if you just want to have a nice and easy devops experience. However, Kubernetes isn't something one can just jump into. There's a bit to learn about how it works before it feels smooth like butter. The purpose of this post is to define some of the components in the system to give a better picture of how to use this great tool.


## Docker

You may have noticed I mentioned Docker in the title, then let Kubernetes be the star. Well, Docker does play a lesser role, but Kubernetes wouldn't work without it's technology. Docker provides the ability to generate images: an exact replica of your application, which allows you to run from the same pristine OS every time. You just need to create a `Dockerfile` in your project directory which defines your desired operating system, then build the image with `docker build -t my-app .`. This image is then a portable wrapper around your app that can run on any machine that can run docker using `docker run -it my-app -- /bin/bash`.

## Kubernetes

### Clusters

A cluster is a collection of nodes. You can easlily have many applications in a cluster by using namespaces, so for most non-sensitive purposes, you don't really need more than one cluster.

### Nodes

A node is a VPS within a cluster. It's empty except for an OS and software that runs and monitors Kube pods.

### Namespaces

A namespaces is an arbitrary identifier that allows you to scope your views and your queries. This scoping makes it easy for you to have 10 apps with production and staging deployments without accidentally deleting or modifying the wrong one.

### Deployments

A deployment represents a single-purpose combination of images. In my experience, this is typically just one image --- your app image. Whenever you create a new deployment or update an existing one, it creates a new replica set and new pods. This is where the ease of use comes in. All you have to do is point your deployment to a new image of your code, and it takes care of the deploying itself.

### Replica Sets

A replica set keeps track of a collection of pods. It knows what image they should be running, and how many of them there should be. Replica sets are directly responsible for the killing of old pods and creation of new ones.

### Pods

A pod is a wrapper around a running image (called a container), that runs on a node. Pods are where all the work happens, and are designed to be amusingly disposable. If you are frustrated with a pod, just delete it --- it's parent replica set will just make a new ones. The important thing to realize is that you can write to disk while running inside a pod, but that data will be wiped out when the pod is deleted or restarted. If you have data to store, use a volume or an external database.

### Jobs

A job is a lot like a replica set, except it expects the pods it creates to terminate. It's basically a cron job ported to the world of Kubernetes. You can specify a pattern for when the job should be executed, and the system will make a pod and run the task at the times you specified.

### Services

A service is an endpoint that routes traffic from the network to the pods in your deployments.

### Ingresses

An ingress is like a service-preprocessor --- it allows you to manipulate and route incoming requests. This is perfect for applications like SSL encryption.

### Volumes

A volume is basically an external hard drive. They are the permanent storage for pods in the place of pods' ephemeral disk space. Data in a volume persists between pod restarts, but there are many different types of volumes with different rules for just how long a volume exists.

### ConfigMaps

Config maps are probably the most complex concept in the whole system. A config map is a key-value map that stores config values for your app. This type of configuration is stuff that's safe for everyone to see, like `APP_ENV=production`. You can store many keys inside one map.

### Secrets

A secret is like a config map, but it's intended for sensitive information like passwords and certificates. Secrets are opaque, meaning their keys are visible, but the values are base64 encoded. Kubernetes decodes the values before setting them as environment variables in your pods.

## A More Linear View

Here is how to get from 0 to deployed code:

1. Create a cluster. This cluster requisitions some nodes and installs the kubernetes software on them.
2. Upload an image of the application to a repository your Kubernetes cluster can access. When using Google Kubernetes Engine, this would be gcr.io.
3. Create a namespace for the app. Everything from this point should be created in this namespace.
4. Create a secret containing all passwords or API keys or whathaveyou.
5. Create a deployment for the app which references the uploaded image and the created secret. The deployment creates a replica set and some pods. It may also requisition a volume if needed. You now have running code.
6. Create a service that points to your deployment. Once the IP address for the service is requisitioned, you now have a public path from the internet to your app, and the job is done.

In future posts, I'll go more in-depth on how to do specific tasks, and annotate an entire configuration.

For comments, questions, or corrections, shout as loudly as you'd like at me on twitter at [@_shreve](https://twitter.com/_shreve).
