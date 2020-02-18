---
title: Getting Started
date: 2020-02-17
---

We're finally here at the end of the first real sprint. It was a fantastic feeling to get rolling. I got placed in my first choice pods, user interface and tools, and based on what I worked on this sprint, I think these were great fits for me.

It's still early yet, so I only got initial prototypes of each thing, but this sprint I was tasked with:

1. [ui] Creating a slider prefab for settings menus
2. [tools] Creating a discord bot for recurring reminders
3. [tools] Creating a prototype playtest data collector

## Slider Prefab

Unfortunately, the UI team isn't really ready to be fully engaged. The game is still trying to become what it's going to be. As such, we've only gotten basic tasks. For this, I just needed a minimally functional slider with a label and value readout.

My fellow programmer in the UI pod got a little overzealous, misread the task, and created the slider for me. He used Unity's built in game UI library and tweaked the style a bit. The only thing he didn't finish was the value readout.

To do this, I created a class with a single function which updates the text that is called on Unity's slider's OnUpdate event.

```c#
public class Slider : MonoBehaviour
{
    public TMPro.TextMeshProUGUI valueText;

    public void OnValueChanged(float value)
    {
        valueText.text = value.ToString();
    }
}
```

<a href="https://i.imgur.com/Ht6IYVL.gif">
<img
alt="A demo of the slider in action"
src="https://i.imgur.com/Ht6IYVL.gif" />
</a>


## Discord Bot

This task was originally just to research bots and pick one. However, Discord has a really high quality JavaScript client and the barrier to entry to bot creation is really low. This means there are a lot of options, most of which are low quality, discontinued, don't do exactly what you need, or require payment (a monthly subscription to the developer's patreon). For example, the top result for a reminder bot has a nice natural language parser for timing reminders, but they can only be one-off, not recurring. I figured with a good Discord client and a server of our own, we might as well create our own bot (with approval of course).

My idea for an MVP was to create a script that would start up the bot, post a particular reminder, then quit, all timed by cron jobs on the server. Something like this:

```cron
# Post at 3pm every Thursday
0 20 * * thu node /opt/reminder-bot/reminder.js reminder weekly-meeting
```

This command would create a post in the announcements channel that looks something like this:

<a href="https://i.imgur.com/ViUnT3u.png">
<img
alt="A prototype post during bot development"
src="https://i.imgur.com/ViUnT3u.png" />
</a>

The interesting thing about developing this tool is that you can't submit a complete post with reactions and every call is asynchronous. You need to perform the message post, then on success post one reaction, then on success post the next one, and so on. To help this manual chaining from getting too deep, I wrote a method called `reactChain` which accepts a message and a list of reactions to post to it. It recursively handles the posting and waiting on promises, then returns a promise you can treat the method call like just another link in a larger chain.

```js
let reactChain = (m, emojis) => {
  let promise = m.react(emojis[0])
  promise.catch(console.error)
  emojis = emojis.slice(1)
  if (emojis.length > 0) {
    return promise.then(() => {
      return reactChain(m, emojis)
    })
  } else {
    return promise
  }
}
```

So for now, the bot connects, posts the reminder and reactions based on the supplied name, waits for completion, then quits. The problem with this approach is that all configuration is programmatic. It wasn't defined in the specification, but I later learned that some stakeholders were hoping for a chat-driven interface to configure their own reminders. This is a difficult feature to implement for several reasons and will require either another large investment of time, or a budget to pay for the existing bot that offers this feature.

After speaking with Nico, we decided to continue this approach for the time being, but may consider pursuing this other option if announcement tweaks are frequent.

The first announcement from the Reminder Bot was just posted earlier tonight!

<a href="https://i.imgur.com/M0AU1w0.png">
<img
alt="ReminderBot's first announcement"
src="https://i.imgur.com/M0AU1w0.png" />
</a>

## Playtest Data Collector Prototype

When I first spoke to Max about the tools team, he left things pretty open-ended in that I could pick from several ideas for tools and just try my best to make progress on them. The one that sounded the most immediately interesting to me was collecting and visually representing playtest data. The UI workload was very light this sprint, so this data visualizer was what I spent most of my time on.

There are two main components to this tool: an in-game collector and an editor panel to expose the data.

The collector was fairly easy. It's a singleton object that opens a CSV file upon instantiation. When it receives events to log, it formats them to CSV and writes them to the file. When the game is over, it closes the file descriptor. There's nothing for anyone to add to a scene to get started as it auto instantiates when called to.

For this initial implementation, I only knew how to trigger on jump events, so that's all that's collected. The planned next step is to create a component on the player that attaches to many of the player's Unity events on other components and logs for them. This would make it easy to turn this playtest logging on and off.

The hard part of this was the editor panel and it's drawing. I started by going through all the necessary management functions like loading the list of playtests, creating a selection menu to pick one, parsing the events out of the file, and creating a button to clear all the playtests. Once I had the ability to pick a playtest and the events as objects in memory, it was time to render them all.

I had been pointed toward gizmos, so that's where I looked. I watched a tutorial and read a couple docs pages and got to know enough to render my collected jumps. However, once I wrote the function, nothing was happening. Much to my chagrin, I read further and further into the docs until I learned that editor windows can't draw gizmos. Only monobehaviours can.

I tried with little success to convert the ideas into a custom editor on a monobehavior, and eventually reverted. Instead, I tried a monobehavior subclass of the editor window. This subclass only had one function, `OnDrawGizmos()`, which called back to the editor window's gizmo drawing function. The editor window had all the data, it just wasn't previously able to execute any gizmo drawing code. Now it was within a legal `OnDrawGizmos()` call, so it was allowed. The window just needed to instantiate an anonymous game object and attach this renderer as a component.

This finally got me the result I was looking for. Here it is in all it's glory:

<a href="https://i.imgur.com/JTsBJki.gif">
<img
alt="The first iteration of the playtest panel in action"
src="https://i.imgur.com/JTsBJki.gif" />
</a>

Unfortunately, this relationship is brittle. Previewing the game with this panel open breaks it. Unity also occasionally refuses to run the renderer because it's inside the `Editor/` folder, even though it's in there 100% of the time.

I've been informed that the Handles API may help me more reliably draw on the scene, and natively from the editor window without the hacky renderer. That is where this project will search next.

## Problems

I lost some time this sprint at the very beginning getting up and running. I completed 494 entirely on my Linux machine, so I expected to be able to do the same thing here. The thing I wasn't expecting was the complication of the external audio engine, Wwise. When I got the project opened in Unity, all I saw was a bunch of errors related to unknown types that all led back to Wwise.

<a href="https://i.imgur.com/duEI72r.png">
<img
alt="Wwise without an OS-specific Wwise installation"
src="https://i.imgur.com/duEI72r.png" />
</a>

I realized there were some OS-specific configurations available, but only macOS and Windows were present. I tried for a few hours to remedy this, but couldn't figure it out. It seemed like Linux support was only experimental at best and not something I should really bother with trying.

This meant I would need to move all development to my gaming computer, which hasn't been used for development before. It took me some more time to get Git, Git LFS, Unity Hub, Unity, and an editor all set up, then get adjusted to the different environment. I'm comfortable with it now, so I can go on like this.

Luckily though, after speaking with Max and Faulkner at the last meeting, I've found that I'm not the only desired Linux user and that Wwise integration may be as easy as checking an extra box during an install wizard. If I'm lucky, I can be back home on my Linux machine next sprint.

### A Final Note: My Goof

I'm used to more expressive languages that C#, and especially more verbose debug logs than the one offered by Unity. I wasted an embarrassing amount of time thinking that file system accesses weren't working because when I would run `Debug.Log(files)`, I would only see the output `FileInfo[]` and think this was an empty list, and not just the type. I was seriously going nuts, thinking I needed to manually transform all the forward slashes to back slashes to support Windows and all sorts of ridiculous things like that. I don't actually know if that's Unity or C# to blame, but gosh dang `Debug.Log()` should show more than just the type name. For now, I'll just accept that I've learned my lesson there.
