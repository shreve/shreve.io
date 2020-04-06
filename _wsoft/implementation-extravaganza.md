---
title: Implementation Extravaganza
date: 2020-04-06
---

Now is a very exciting time to be on the studio development team. Lots of work
that's been done in separate branches and the testing folders are coming into
the main scenes, and it's starting to feel like a real game. I finally got my
work to show up, but not without some trouble. Let's get into it.

Here's what I worked on this sprint:

1. [ui] Create new menu intro animations
2. [ui] Integrate the pause menu into the game
3. [ui] Create a health bar for the player
4. [tools] Update auto builder functionality

## Menu Animations

(about 9 hours)

Previously, the menu would just fade and drop in as a whole panel. Kaavya had
asked me to play around with some ideas to make it more dynamic and interesting,
and the obvious next step to me was to split up the elements and make them
animate independently. Unfortunately, the menu wasn't designed with that in
mind.

// Video of old intro

The main layout of the menu is a container with a Vertical Layout Group
component. This automatically arranges its children into the same width and
sets their y offset within the container. My first idea was to have the elements
slide in from the side, which requires animating their x offset. This was a
no-go because the VLG also locks the x offset for it's children. I looked around
the source code of the component for a way to turn this off, but to no avail. I
also tried to find an alternative, but the layout the VLG provides is a decent
amount of work to replicate. Ultimately I found the solution in wrapping each of
the elements in a blank wrapper.

// Pic of menu tree

This wrapper element can be constrained by the VLG parent to provide structure,
match the height of it's children to be consistent, and not restrict the
location of it's children to allow the animation I was looking for. I put
animators on the element prefab and created animations that match each type of
element. I then linked the menu animator to the animators of it's elements so
they would all either be open or closed based on the parent.

// Animator with different children
// Animators can retain properties for different children so the same animation
can be applied to different prefabs

I made three different animations, but I think one is clearly the best.

// 3 animation demos

I really like the falling down animation because it matches the motif of the
game, traveling downward into the abyss. That's the one the UI team decided on
as a whole as well.

This work took me about 7 hours to complete. It got reviewed and merged, but
when I came back later, the menus were no longer animating, and it looked like
my changes had been reverted. Each prefab in the system with a nested prefab was
pointing to an old version which no longer existed. For example, Looking at the
InGameMenuSystem, I would see old versions all the screens. Looking at the
screens, it would show the updated layout, but still refer to old element prefabs.

// Video of prefab glitch

I tried to delete the children and replace them with the prefabs I knew to be
good, but they would just reflect the old versions again. I tried restarting
Unity and restarting my computer as that sometimes fixes weird Unity glitches,
but I realized it must have something to do with Unity's meta information about
prefabs or the way they were serialized. I ended up needing to rebuild all the
screen and system prefabs, which was unfortunate, but relatively quick because I
could copy components and properties from the old versions before deleting
them. This whole mess cost me about 2 hours of research and repair time.

I think the lesson here is to be careful when merging updates to serialized
Unity objects. Conflicts in code are easily resolved by a human, but conflicts
in these large, opaque yaml files aren't. I didn't get a chance to investigate
exactly what happened, but I think Billy merged development onto his branch
after making changes to the prefabs, and git automatically resolved the changes
when it shouldn't have. I should have warned him about these structural changes
coming down the pike.

## Integrate Pause Menu

(about 7 hours)

I have been working on getting the menu system ready for essentially the entire
semester, so when it was time to get them into the game, I was delighted. I had
designed them to be drop-in-and-go, so I dropped the InGameMenuSystem into the
Crystal Caves scene, gave it a quick test with the keyboard, saw it worked, and
rolled it out. Soon after, I was getting asked where the menus were. It turned
out it wasn't working with gamepads in the game scene.

This was a difficult bug to triage because it wasn't actually a bug. The menu
system and all it's related components were identical between where it worked
and didn't. I opened the input debugger and saw it registering button presses.
It worked with gamepads if they were used first, meaning no keyboard or mouse
interaction. Eventually I noticed that when it wasn't working, it registered as
player index 1. At that point, I took a closer look at the documentation and
realized my mistake.

{% include figure.html img="https://i.imgur.com/lgiFL7f.png" caption="class
PlayerInput represents a separate player ... and a set of paired device." %}

I was using the API incorrectly by having one on the menu system in the same
scene as one on the player. This was devastating because it's such a nice
system. The game object attached to a PlayerInput gets SendMessage'd whenever
any registered action occurs, so handling events is dead simple. I now had no
choice but to rip out niceties of my menu I had worked on so hard on. I spent
over an hour on a call with Max trying to figure out what to do, and ultimately
we decided the menu would just have to be made to work without these event
calls.

It took some restructuring but eventually I got the menu to open through a chain
of events started on the player, then the menu closing would reverse the chain
to restore functionality to the player. The event system was always the thing
handling the very basics of the menu like keeping track of which object was
selected and calling the click and change events, so that still worked. However,
I had spent a lot of time on features like auto-switching between highlight and
selection when switching from keyboard to mouse and pressing the cancel button
to back out of a menu which are now disabled because of this event change.

A lot of things went wrong here including my lack of knowledge of the input
system and the general lack of knowledge of the system because it is still
pretty new and undocumented. It's currently not even production-ready 1.0
launched. There's currently not much direction from Unity on how to use the new
input system with user interfaces. There is an `InputSystemUIInputModule`, which
is intended to be used for UI systems, but doesn't appear to offer a very
similar functionality to the `PlayerInput` module. For example, a cancel event
in the former is dispatched to the currently selected element rather than the UI
system with the component on it, making it more difficult to have consistent
behavior.

I have an idea I'd like to try to implement, but as we're headed into the
pre-gold sprint, I don't think it will get merged as it may be a kind of big
change.

Rather than having multiple PlayerInput modules (not correct implementation) or
using an in-place PlayerInput to broadcast events up and out (sloppy and
inconsistent), I'd like to have a global InputDispatcher. This component would
take the PlayerInput component and delegate events to the appropriate game
object via SendMessge as well as handle switching action maps. This would allow
both the player and UI system to enjoy the full benefits of the nice PlayerInput
system.

## Health Bar

(about 6 hours)

The concept for the health bar is to have a branch with leaves representing the
amount of remaining health. There wouldn't be a one-to-one match between leaves
and hits remaining, but instead the leaves would go through three states to
represent damage. To start, I made a static branch image and three leaf images
with animators.

My design goals were to have the internal state simply be one number, the total
amount of remaining health, and for each update to only update the necessary
animators rather than looking at each one each time. To accomplish this, I
needed to translate the health number into a leaf identifier and a state
identifier to perform the update. There are three leaves and three states, so I
set out to find the equation that would perform my mapping. I tried a few kind
of whacky solutions that didn't quite work before I realized the problem in my
thinking: these states aren't all unique. The death state of leaf n + 1 is the
same state as the healthy state for leaf n. This provides us with a very
satisfying solution.

```c#
private int leafIndex
{
    get
    {
        // Provides the index of the current leaf to be operating on
        // H 0 1 2 3 4 5 6
        // I 0 0 1 1 2 2 3
        return health / 2;
    }
}

private int stateIndex
{
    get
    {
        // Provides the index of the state of the leaf animation
        // H 0 1 2 3 4 5 6
        // I 0 1 0 1 0 1 0
        return health % 2;
    }
}

// To update the appropriate animator
leaves[leafIndex].state = HealthBarLeaf.STATES[stateIndex];

// Simplification of real code
// In some cases, we want to restore the previous leaf to healthy
if (stateIndex == 0) {
    leaves[leafIndex - 1].state = HealthBarLeaf.STATES[2];
}
```

The downside to this approach is that it only works for one step at a time. If
the health were to be suddenly shifted by more than 1, all the leaves might not
update correctly. Fortunately, I have control over the public API. The input
source of data is Health.OnHealthChanged, which supplies an integer value of the
new player health whenever it is changed. I added a listener for this event
which takes the difference between the new health and the internal health stat
of the bar and runs the change that many times.

```c#
public void SetHealth(int newHealth)
{
    int diff = newHealth - health;
    for (int i = 0; i < Mathf.Abs(diff); i++)
    {
        // changeHealth has one parameter, up, which is a bool.
        changeHealth(diff > 0);
    }
}
```

This was a very satisfying project because it was the first time I was able to
create and deliver something in one short go. This was shipped after about 6
hours of work. I had already been learning how to effectively use animators from
my work on the menu systems and the data source already existed, so everything
was in place for this to be executed smoothly.


## Auto Builder

(about 3.5 hours)

When I last left off, I had a cronjob running to pull the code frequently, then
a separate job to build the game. This was working, but we got a new
requirement: building off of different branches. This solution currently only
pulled updates from the development branch.

I realized it was in everyone's best interest to update and build at the same
time and to package that into one single command. I created a script which takes
one optional argument, a branch name. If none is specified, it defaults to
development. This script forcefully pulls the new code and runs the builder image.

```bash
CODE_DIR=${CODE_DIR:-/var/code/project-blue}
BUILDER_DIR=${BUILDER_DIR:-/opt/auto-build}

branch=${1:-development}

echo "Fetching latest code"
(
        cd $CODE_DIR &&
        git reset --hard &&
        git checkout $branch &&
        git pull
)

echo "Starting build process"
(
        cd $BUILDER_DIR &&
        sudo docker-compose run --rm unity build
)
```

There are a few things of note here. We need to do a hard git reset before
checking out and pulling because the build process often changes some files and
leaves our working tree dirty, which would cause the following commands to
fail. We use the `--rm` flag on the `docker-compose run` command because docker
creates a new container with a new virtual disk every time. We are writing a lot
to these virtual disks that we could throw away, so without deleting them, they
would quickly fill up the server's disk space. We also need to use `sudo`
because the root user is the only configured user capable of running
docker. This will be important later.

The process of removing the old commands, writing this script, and installing it
to work took about 1.5 hours.

At this point I received a new request from Nico, that the master branch be
built when it is pushed to, rather than a regular time of the week. This meant
I'd need to freshen up on my git hooks.

There's a hook for when a git project is pushed to called `post-receive`. This
script is passed a list of references which have changed and their old and new
hash versions. I just have to read this input and look for `refs/heads/master`
to trigger a build.

```bash
read line
# input in the format: old new ref
ref=$(echo "$line" | awk '{print $3}')

if [ "$ref" = "refs/heads/master" ]; then
    # If we pushed to master, we want to tell root we're ready to build.
    touch /tmp/build-sentinel
fi
```

As you can see, we aren't directly running the build. This is because the user
running the git server is atlbitbucket. This user doesn't have the ability to
run the autobuilder. Instead, we create a sentinel file in a pubic,
world-writable directory and let root look for it. This means we don't need to
elevate Atlassian's privileges on the server. The root user's crontab file now
looks like this:

```bash
# Every day at 12pm (8am EST) build off development
0 12 * * * /opt/auto-build/runme.sh

# Every minute we check for the build sentinel. If it's there, build master
* * * * * [ -f /tmp/build-sentinel ] && rm /tmp/build-sentinel && /opt/auto-build/runme.sh master
```

This strategy allows us to tell root to run something without adding any
additional vulnerabilities because we're only providing a binary value (is the
file there or not).

## A Note on the Playtest Data Tool

In the last sprint, I finished the final step needed to release the playtest
data collector, correcting the data save path for the built game. This sprint,
I rolled it out and shortly thereafter had to roll it back.

One issue was that the folder for storing the playtest saves in the editor
hadn't been kept in the git repo so it was causing errors because the collector
couldn't save. This hadn't occurred to me becaue my "Playtests" folder had
always been there as the one who developed the feature. I had written a
git ignore rule to not include the whole folder, but it needs to exist for the
file creation command to work. The fix for this was to add a `.gitkeep` to the
folder and change the ignore rules to just ignore the data files.

By this point, someone had already pushed a commit disabling the collector
component by default. With it turned on, I was receiving more complaints that it
was hindering performance. I think I know what the issue may be, but at this
late stage, I can't really invest the time to reproduce and fix the issue in
this non-essential feature. I've resigned myself to this tool not being able to
be used for this project. The playtest data collector will just need to be my
gift to next semester's studio team.
