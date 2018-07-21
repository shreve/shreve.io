---
layout: post
title: A Gentle Introduction to Kubernetes
date: 2017-08-17
updated: 2018-07-21
tags: devops beginners-guide
description: Get introduced to the concepts at play in the Kubernetes ecosystem to begin your journey to devops bliss
image: http://i.imgur.com/rbKYmlV.png
---

Manually managing servers is a pain. Setting up a server you already know the
desired configuration for feels like a huge waste of time. There are tools
available to help automate this process, like capistrano, puppet, and chef,
but they don't solve the whole problem, and to me felt quite brittle.
There has to be A Better Way&trade;.

That's where Docker and Kubernetes come in. Docker makes your application
environment portable, and Kubernetes allows you to easily reproduce and deploy
your application.

This post focuses on Kubernetes. I'm currently working on a Gentle Introduction
to Docker, but in the meantime, just know that Docker allows you to create a
virtualized operating system with just the tools you need to run your
application and in a format that can be easily moved around.

I like this solution a lot, and it seems others do too:
[GitHub](https://githubengineering.com/kubernetes-at-github/),
[The New York Times](https://www.youtube.com/watch?v=P5qfyv_zGcU), and
even
[Pokemon GO](https://cloudplatform.googleblog.com/2016/09/bringing-Pokemon-GO-to-life-on-Google-Cloud.html) all
run on Kubernetes. Let's take a look at what makes it so good.

## What is it?

Kubernetes is called a container orchestration system, which basically
means it runs Docker images. Many other systems can run docker images,
though. What makes the Kubernetes approach special is that it's an abstract over
the whole deployment stack.

Kubernetes defines some general ideas about how to deploy software, lets you
link them together in a declarative format, then leaves it up to the host to
turn your plan into reality. This is great because first, you don't need to
learn the minutia of your host's platform to set anything up, and second, you
can move your abstract plan from one host to another effortlessly.

*Think of it as a new standard for defining software infrastructure.*

## How do I use it?

While it's revolutionary, Kubernetes is just software. You control your
Kubernetes cluster by sending configuration to your instance of the software
running on a special computer called the master. The easiest way to interact
with the master node is the command line tool
[kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/).

You need to install kubectl, then configure it to authenticate with your master
node. This configuration will be different for each provider (Amazon Web
Services, Google Kubernetes Engine, etc.), so I'll leave that for you to figure
out on your own.

Once you have kubectl configured correctly, you can begin uploading config files
to create Kubernetes objects. You'll usually want to keep these configurations
in separate files (one for each object) to help with readability and
organization. If you have a directory of config files you want to create, you
can use `kubectl create -f config/kubernetes/`. The `-f` flag accepts
either a directory or single file. If you've already created an object and want
to ammend it, apply the patch with `kubectl apply -f config/kubernetes/object.yml`.

Kubectl also provides access to inspect your objects. Use `kubectl get all` to
see all your objects. Use `kubectl describe [object ref]` to see the details of
an object. The object reference is usually in the format of `type/name`, like
`deploy/web` or `po/web-sn7zk`.

If you're like me and prefer a graphical interface for status dashboards, you
can also use the dashboard from the master node. Run the command `kubectl proxy`
to create a proxy that allows you to see a graphical dashboard of your cluster
at [http://localhost:8001/ui](http://localhost:8001/ui). This interface allows
you to see information about your whole cluster including logs, as well as
delete objects.

Kubectl is capable of much more, but these are the things I use most frequently.
*The more you learn about kubectl, the more capable you will be in managing a
kubernetes cluster*.

## Glossary

There are lots of great articles about the finer details of all of these terms
in the [Kubernetes Concepts](https://kubernetes.io/docs/concepts/)
documentation, but this glossary is meant to be an introduction for those not
yet familiar with Kubernetes.

Cluster
: The global scope of kubernetes. Each cluster has it's own master node and any
  number of node pools contained within a virtual private cloud.

Config Map
: A key-value storage of arbitrary data. The data can be mounted onto a
  container as environment variables or as files. For example, if you need to
  configure a container with a config file, you can create a config map with a
  key equal to the file path and a value that represents the contents of the
  file.

Container
: A running docker image

Deployment
: A controller for replica sets. Instead of creating replica sets directly,
  create a deployment, and it will update and create replica sets for you. To
  deploy new code, use kubectl to change the image used by a deployment. The
  deployment will scale down the old replica set and create a new one with the
  new image.

Image
: A docker image is a complete filesystem that can be virtualized to run
  programs. An image is static, has no state, and never changes. Applications
  need to be bundled as images to be run on Kubernetes. The value of an image is
  that it is a singular object that contains all dependencies required to run a
  program, so it can be easily duplicated, distributed, and scaled.

Ingress
: An opening to the outside world. All the other objects are private within the
  cluster's virtual private cloud, but an ingress creates a public IP address
  and routes it to one or more services.

Job
: A controller that runs one or more pods to completion. If any of the pods fail
  to complete successfully or are deleted, the job will create a new one to try
  again. Once all the pods are complete, the job is complete. Delete completed
  jobs to delete the containers they created.

Namespace
: A scope for any kubernetes objects. This is useful for having several
  different projects within the same cluster because they can share the same
  resources without stepping on each other's feet. You can set a namespace in
  kubectl so that all operations only affect the desired objects.

Node
: A virtual private server that is configured with a docker-equipped operating
  system that can run containers. The kubernetes maintainer doesn't need to be
  aware of nodes as kubernetes automatically distributes pods amongst the nodes
  seamlessly. Nodes occasionally need to have their software upgraded, but some
  hosts can do this automatically.

Node Pool
: A collection of connected nodes. Any node pool shares all of the pods deployed
  to a cluster. All of the nodes in a pool are identical and could run any of
  the pods assigned to the pool. When a node pool needs upgrading, one can
  either turn off the pool and upgrade resulting in several minutes of downtime,
  or one can create a new pool, move all the pods to the new pool, then disable
  the old pool resulting in no downtime.

Persistent Volume
: The kubernetes representation of an available storage disk. Every container
  has an ephemeral file system that is erased whenever the process is
  restarted. Mounting a persistent volume allows you to save data between pod
  restarts. The options available to configure the disk depend on your hosting
  provider.

Persistent Volume Claim
: A request for a persistent volume that defines needed parameters like format,
  size, or class. If no persistent volume exists that matches the parameters,
  the kubernetes system will try to create one. A matching persistent volume is
  forwarded to and mounted on the container attached to the persistent volume
  claim.

Pod
: A collection of containers and container accessories. Every pod must point to
  at least one image that the pod will run, but you can additionally define
  environment variables, attach config maps, mount volumes, or change the
  arguments used to run the image. In many cases, there will be one container
  per pod, but you can include more if you need multiple processes running
  together, like an application and an HTTP proxy to that application, for
  example.

Replica Set
: A controller that maintains a collection of functional pods at all
  times. Replica sets are essentially a pod template and a desired count. If
  there are less or more pods than the desired number, the replica set will
  create or destroy pods until the desired number exist. This means if a pod
  gracefully exits, crashes, or is deleted, it will be automatically
  recreated. This is extremely valuable for long-running web applications.

Secret
: Essentially a config map where the values are stored as base64
  encoded blobs which are decoded upon mount to a container. This is intended
  for things like passwords and SSL certificates.

Service
: A networking tool that gives a name to a destination. For example, you might
  create a service named redis that points to your Redis pods. This
  allows your other objects to find those pods with hostname `redis`. This is
  useful because pods can't reliably keep the same IP address.

Workload
: Refers to pods or controllers, which create pods.


For comments, questions, or corrections, shout as loudly as you'd like at me on
twitter at [@_shreve](https://twitter.com/_shreve).
