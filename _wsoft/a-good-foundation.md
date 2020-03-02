---
title: A Good Foundation
date: 2020-03-02
---

This sprint was defined by getting some good system foundations in place. These
elements are now in a postion to be formed by the talented artists and designers
on the team.

Tasks for this sprint:

1. [ui] [Create the pause menu system](#creating-the-pause-menu)
2. [tools] [Make improvements to the playtest data explorer](#playtest-data-explorer)
3. [tools] [Create a system for automatic game builds](#game-builds)


## Creating the Pause Menu

I found [this tutorial](https://www.youtube.com/watch?v=QxRAIjXdfFU) very
helpful in creating a basic menu system. It covers some good layout patterns and
tools, intro and transition animations, and a small script to tie it all
together. I used this to build a frame for the menus to be filled with
content. I also updated the existing button and slider prefabs to fit within
this framework, then created the first menu sample.


{% include figure.html img="https://i.imgur.com/UCRySJa.gif" caption="First
implementation of the generic menu" %}

This was a nice start, but pretty unattractive. It also had a poor experience
based on the default event system configuration. First, there are several states
of "selectable" items, like the buttons and sliders. There is a state for an
option being selected, which represents the pre-button-press stage for gamepad
inputs, but post-click for mouse inputs. There is another state, highlighted,
which indicates the pre-click hover state for mouse inputs, but nothing for
gamepads. The system doesn't intuitively switch between utilizing these states
even though it can handle automatically switching inputs.

The fix for this was to manually make some adjustments from the menu
manager. First, upon opening a menu, if the input is a gamepad, we need to
select an item so navigation from the gamepad can work. This doesn't click the
button, but makes places the navigation cursor there. Secondly, whenever the
menu system is closed, we deselect whatever the current selection was. This
clears the state from the mouse click, which persisted between menu opens.

```c#
if (input.currentControlScheme == "Gamepad")
{
    eventSystem.SetSelectedGameObject(menu.topItem, null);
}

if (menu == null)
{
    eventSystem.SetSelectedGameObject(null, null);
}
```

I also made some stylistic updates, changing the design and animation and using
a screenshot from the game as some visual context.

{% include figure.html video="https://i.imgur.com/4H0fHlJ.mp4" caption="The
restyled menu" %}

There were still a few more issues yet. First, I substituted the placeholder
triangle image for a leaf image, updated the slider selected style to
differentiate which input is selected, and introduced a debounce library to deal
with quick input events.

To elaborate, we recieve a lot of events from every gamepad input. This makes a
lot of sense for controling the player as it offers fast response
times. However, we don't need so many events for navigating the menu. This
default behavior made it difficult to select the menu item you want because a
slight input would move the cursor several spaces. To remedy this, I made a
debounce tool, which helps to prevent many method calls within a short period of
time.

```c#
public class Debounce {
    static Dictionary<string, float> dict = new Dictionary<string, float>();
    public static bool Test(string name, float delay)
    {
        if (!dict.ContainsKey(name))
        {
            Debug.Log("New debounce key. Adding.");
            dict.Add(name, Time.time + delay);
            return true;
        }

        if (dict[name] < Time.time)
        {
            Debug.Log("Past debounce delay. Refreshing.");
            dict[name] = Time.time + delay;
            return true;
        }

        Debug.Log("Rejecting event repeated too early.");
        return false;
    }
}

// In Menu Manager
public void OnMenu()
{
    if (!Debounce.Test("OnMenu", 0.25f)){ return; }
}
```

This example only allows the menu toggle function to be called once every 0.25
seconds. This is needed because OnMenu gets called twice for every gamepad
button press. I believe this is because the function is bound to keydown and
keyup events. I can certainly forsee some more complex solution to this, but the
debounce library was a quick fix without much intertangling of classes.

{% include figure.html video="https://i.imgur.com/gxp66QI.mp4" caption="The
final version of the menu for this sprint" %}

There was one last issue to deal with: reproducability. This task was about
creating prefabs so others can easily create new menus as needed. The way Unity
defines prefabs added some friction here. Menus have some deep structure, and
the part that needs customization in particular, the contents of the menu, is
nested most deeply.

{% include figure.html img="https://i.imgur.com/0IutAAS.png" caption="Menus have
a somewhat deep structure" %}

Once you have a prefab, you aren't able to change or rearrange children of that
root element. This is a no-go for menus. I had tried duplicating prefabs so each
one could have different contents, but this prevents them from getting all the
same style updates when the design inevitably changes.

Eventually I found Unity's Prefab variants, which got the job done. This option
allows us to have an empty root menu prefab which contains most of the styling
information, then create variants of the prefab which are allowed to have
modified children.

{% include figure.html img="https://i.imgur.com/EGQI37c.png" caption="The menu
prefab" scale=1.5 %}

{% include figure.html img="https://i.imgur.com/9TJrflf.png" caption="The pause
menu prefab derived from the generic menu prefab" %}

Now updates to the style of the menu will be applied to these implemented menus,
and new menus can be created without having to crack apart an existing prefabs.

There is one large remaining issue which I plan to explore over break. These
menus are used when the game is paused, which will likely be done with
`Time.timeScale = 0f`. In light of this, the animations need to be run within
unscaled time in order to work.

## Playtest Data Explorer

At the end of last sprint, there were some big problems with the playtest data
explorer. In this sprint, I was able to address several of them.

1. The on-scene drawings were done in a very hacky and unstable way.
2. Calls to the data recorder needed to be placed inline in code, making
   implementation spread out and spaghetti-like.
3. The only events being logged were jumps
4. When there were a lot of events to show, the view was crowded.

When I built the initial prototype of this system, I was only aware of the
possibility of drawing on the scene with Gizmos. Gizmos can only be drawn by
objects that inherit from MonoBehaviours. To perform the drawing this way, I had
my editor window create an anonymous GameObject intended only for
rendering. This implementation causes problems when running the game preview,
occasionally fails for seemingly random reasons, and ultimately just feels
wrong.

I was advised by Max that the Handles library can perform the same types of
drawing actions and perhaps even more sophisticated ones. The difference is that
Handles are drawn by custom editors rather than MonoBehaviours. I was able to
port my existing editor window + renderer to a custom editor mostly just by
changing the Gizmo drawing statements to Handles ones. I made this editor the
custom editor for the component I created to address problem 2.

In order to centralize the data collection calls, I created a component on the
player which adds listeners to various UnityEvents on other player components
to capture data about the events. The tricky part of this is that UnityEvents
aren't able to pass data. I am only able to know *when* something has happened,
but not anything about *what* happened. To address this, the component also
keeps references to other components and reads the data itself.

Even this fix isn't quite good enough, though. It's restrained to being run when
the source triggers the event, which could be arbitrary. An example here is the
jump event. The jump event is invoked before the `DoJump` routine is run.

```c#
private void DetermineIfCanCoyoteJump () {
	if (playerColl.collInfo.inAir && !jumping && playerVelocity.y < 0f && jumpInputDown &&
		(Time.time <= (playerColl.collInfo.timeLeftGround + coyoteJumpTimer)))
	{
		OnJumpGround.Invoke();
		DoJump(new Vector2(playerVelocity.x, maxJumpVelocity));
	}
}

if (playerColl.collInfo.onGround) {
	OnJumpGround.Invoke();

	jumpVelocity = new Vector2(playerVelocity.x, maxJumpVelocity);
	DoJump(jumpVelocity);
}
```

This means the velocity of the jump isn't even calculated by the time the
logging event which wants to record it is run. We have to wait until the end of
the frame to ask the player for it's new velocity post-jump in order to record
the jump.

```c#
void LogJump()
{
    StartCoroutine(WaitThenLog(LogJumpDirection));
}

delegate void VoidFunc();

IEnumerator WaitThenLog(VoidFunc f)
{
    yield return new WaitForEndOfFrame();
    f();
}

void LogJumpDirection()
{
    PlaytestData.LogVector(rigidbody.position, "jump", rigidbody.velocity);
}
```

This coroutine approach works, but the whole process would be easier if events
were able to pass data to listener functions.

To enhance the collector further, I set up collection for several more events:

1. Projectile Throw
2. Teleport
3. Hazard Collision (Death / Respawn)

My understanding is that gameplay will get more complex and will require logging
on different variables, like health events. The benefit of this centralization
change is that those kinds of updates will be very easy. I already have
listeners for health change events, but there isn't a playtest example ready for
these yet.

{% include figure.html img="https://i.imgur.com/T1owX0R.png" caption="Example
playtest with new event logging" %}

As shown, with all data being displayed at once, it can be tricky to see
particular events you want to focus on. This will only get worse as we collect
more data. To help address this, I created checkboxes to toggle the view of
every event in a playtest. When unchecked, these events will simply not be
rendered.

{% include figure.html img="https://i.imgur.com/l2wOufq.png" caption="The new
custom editor with event toggles" %}

There is one more issue that hasn't really been addressed yet, which is the
saving of playtest data for built games. When run in the editor, playtests will
save to the assets directory. When built, the game can only write these new
files to an obscure, generally hard to access directory which varies based on
the operating system. We will still need to talk through the ideal workflow to
figure out the solution for this.

As mentioned as the general theme of this post, I think this tool is in a good
foundational state. The next step is to work with designers on various pods to
figure out exactly what their reporting needs are. Once we address this and the
build log issue, it will be ready to put into people's hands to start collecting
playtests!

## Game Builds

The automated game builds are still a point of contention. We have a couple
competing interests and things haven't quited played out to a dead end.

First, the studio has access to a Linux server provided by the University. The
ideal situation would involve performing the builds and hosting the results from
this server. This is possible, but there is a problem. Unity's Linux editor is
capable of making compatible builds for Windows and MacOS, but the game still
needs to compile on that platform. This is a problem because the game currently
doesn't build on Linux because of it's reliance on the Wwise engine. I don't
have good insight into this, but it sounds like Wwise can support Linux, but
wasn't configured that way for our project. The audio lead, Faulkner, has
reached out to see about adding this support.

If we are able to build on Linux, I have a Docker container set up already in
order to easily install Unity on the server. If this doesn't pan out, our next
option will be to run the build on a virtual Windows machine on AWS. This is a
frustrating option because it will cost money and move computation elsewhere. It
would be more efficient, free, and a good use of our server for this to not be
the case.

Whatever the case ends up being for the platform, thanks to Arbor Interactive,
we have a Unity script that will perform the build. Once we have confirmation of
the platform, I'll be able to execute on launching the nightly builder in a
minimal amount of time.
