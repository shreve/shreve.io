---
title: A Rough Sprint
date: 2020-03-15
updated: 2020-03-23
---

This sprint was defined by a marked lack of productivity. It started with spring
break and ended in the middle of a global pandemic, so it was kind of tough to
get anything done.

## Progress This Sprint

Let's start by talking about what actually did get done.

1. In-game menu progress
2. Automated build deployment
3. Set up SMTP server
4. Playtest data collector tweaks

### In-Game Menus

(approximately 5 hours)

The menu systems took a big step forward in terms of usability. I made sure they
linked together well, worked with all inputs, and had consistent
aniimations. The input system in particular took a lot of tweaking.


{% include figure.html video="https://i.imgur.com/0ngO33K.mp4" caption="It looks
very similar to last sprint, but feels much better." %}

I also wrote a page on confluence explaining how the various components of the
menus are interlinked so that anyone else could pick up where I left off on this
work.

Based on pod meetings, the next sprint should see some better artwork and
actual settings be placed into the menus.

### Automated Builds

(approximately 3 hours)

I was able to deploy the automatic build tool onto the server, and actually get
the game built. This is a huge step forward in terms of shortening our feedback
loops because we have so many people working on the game that aren't programmers
with Unity installed on their machines. From now on, you'll be able to get
nightly builds at [https://studio.eecs.umich.edu/builds/](https://studio.eecs.umich.edu/builds/).

I'm hoping I'll be able to do something with the output, like send an alert to
Discord if the build fails, or inform people about how many warnings there are.

### SMTP Server

(approximately 1 hour)

Another task not directly on game development, but will be useful for processes
around development is to set up outgoing email. Our productivity tools allow you
to point to an SMTP server and they'll send all needed emails. Until now, we've
been using Nico's personal GMail account as that server. This isn't really
sustainable as with enough emails sent this way and Google will ban your account.

I was able to set up an outbound SMTP on the studio server using postfix. This
software is very complex, but right now we don't have very complex needs, so
this process was relatively short. I confirmed that it wasn't allowing any
outside connections, then hooked it up to Jira and Bitbucket.

In the future, I'd like to implement some email security like SPF, DKIM, and
DMARC to verify the integrity of our emails and help ensure they'll get through
email filters.

### Playtest Data Collector

(approximately 2 hours)

The playtester was just about ready to go, but there wasn't currently any way to
get the recorded playtests out of a built game. They could only be collected by
playing the game in the browser. In this sprint, I tweaked the log path based on
build variables to put playtest logs next to the game executable.

## Setbacks This Sprint

There have been a lot of distractions and setbacks this sprint, personal and
professional.

In general, I haven't been greatly affected by the Coronavirus outbreak, but
the first few days after classes were moved online kind of went by in a blur. My
girlfriend and I are both immunocompromised, so I was scared and focused on
making sure we would be ok.

In addition to this, I also lost a couple days to my crohn's disease. I was
due for my bimonthly medication at the end of break, but had some cold symptoms,
so had to push out the treatment. By the following Monday, I couldn't stay
awake. I woke up, drove my girlfriend to school, took a nap, had lunch, went
back to sleep, picked her up, took another nap, had dinner, went back to sleep,
then went to bed. I was able to reschedule my treatment so I only lost 2 days to
sleep.

### Teamwork

(approximately 3 hours)

I spent a lot of time this sprint on conflicts based around working as a team. I
wasted quite a lot of time trying to merge together my work with someone else's,
and I spent even more waiting for others to deal with issues that were blocking
me.

My UI programmer teammate, Billy, was assigned to work on the main menu while I
was working on in-game menus. In hindsight, we really should have either worked
together or just had one person working on menus. Billy finished his menu
implementation first, and the discussed plan was for me to merge his work into
mine and get them "consistent" and merge them into development. We hadn't really
done anything similar, and I was working more on prefab templates than
implementations, so merging wasn't really doing anything meaningful. I ended up
reimplementing his menu with my prefabs.

I think the solution to this would have been to identify before we started
working that the menu systems should be the same throughout. We should have
built the system before trying to implement it.

The other teamwork issue this sprint was that I needed to get the game built,
but there were several errors preventing compilation written by other
members. The culprit in the majority of those cases was writing custom editor
classes within the same file as the object they are editing. Unity requires
these editors to be in special Editor directories at compile time, but allows
them to work inplace in the Unity editor, so these developers were unaware.

I tried the simplest option of just moving the classes that needed to be moved,
but there were still errors related to the coupling between the editors and
their objects. Thinking this would be a quick fix for the original authors, I
reached out to them in discord asking them to address the problem. After a week
and a half and an extra reminder from Max went by, nothing had been done, so I
needed to do it myself. The fixes weren't difficult technically, but because I
didn't know the files, felt like putting away groceries in someone else's
home. I issued a PR with the changes and the parties involved approved the
PR. One of them was greatly affected by the virus situation and was no longer
able to participate in the project at all.

The lesson here was that I need to be responsible for my own blockers. I was
pretty passive in waiting for others to get on top of fixes to their code, but I
should have been more proactive about asking them or doing it myself
earlier. Meanwhile, my tasks were sitting with no progress themselves.
