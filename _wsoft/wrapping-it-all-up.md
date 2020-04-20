---
title: Wrapping It All Up
date: 2020-04-20
---

Here we are at the end of the semester, and the final blog post for this
project. This post represents the last two sprints, which called for getting
everything in the game and polishing it all up. Due to some logistic issues,
those two purposes got kind of blurred together, particularly for the UI team.

As part of the COVID-19 aftermath, Kaavya, our pod leader was unreachable for
about a week, at which time I didn't have concrete assignments. When she got
back online, though, she was ready to set everyone straight and get everything
done. With the proper direction, this past week I got enough done for two weeks,
and just in time to wrap up my involvement in the game.

Here's what I worked on this sprint:

1. Updates to the health bar
2. Adding a credits sequence
3. Lots of miscellaneous issues
4. Documentation for my tools contributions

## Health Bar

(about 8 hours)

This sprint started with adding proper art to the health bar I implemented last
time. There was initially some weird miscommunication about the assets to use. I
didn't receive anything from my pod's art team, but was instead told to get the
assets from Nico. When I got them from him, I went to add them to the game and
found out someone had already added them. I used what was labeled as the player
branch and leaves, but when I posted it, I got some weird news: I was using the
boss branch art. Someone who wasn't working on this task had added the wrong art
to the project.

Anyway, I got the correct art and had to rearrange the leaves to fit. Then I
went through a few rounds of revision resizing the element, resizing and
recoloring the leaves, and updating the animations. This also involved finally
updating the canvas to scale with screen size.

Once it was looking just as it should, it was time to reliably link it to the
player. As with the menus, I wanted a system I could just drop into a scene and
not have to link in the editor. Max suggested and implemented an option,
`PlayerReference`, which would keep a reference to the player gameObject that
could be accessed easily from code. At this point, the player health bar was
working exactly as expected.

I also needed to add a Boss health bar. Not wanting to reinvent the wheel at
all, I adapted the existing health bar into one that would work for both the
player and the boss. This could have been done before because both the player
and the boss have the same Health component. However, with the last change which
auto-links, it only works for the player. In response, I added a field
representing who to attach to, and added a similar BossReference component.

```c#
void Start()
{
    if (healthCharacter == HealthCharacter.Player) {
        healthRef = PlayerReference.Get()?.GetComponent<Health>();
    } else {
        healthRef = BossReference.Get()?.GetComponent<Health>();
    }

    healthRef.events.OnHealthChange.AddListener(SetHealth);
}
```

This got the bar working for both the player and the boss, but with one
caveat. This linkage happens at the beginning of the scene, but the boss isn't
relevant until the very end. I needed a way to hide the boss health bar and show
it later. Fortunately, there are hooks for this very thing on the
`BossStateMachine`. I added a boolean to show or hide the bar, animated it up,
then hooked that into the BSM.

```c#
void Start()
{
    if (healthCharacter == HealthCharacter.Player) {
        healthRef = PlayerReference.Get()?.GetComponent<Health>();
    } else {
        GameObject boss = BossReference.Get();
        healthRef = boss?.GetComponent<Health>();
        BossStateMachine bsm = boss?.GetComponent<BossStateMachine>();
        bsm?.events.OnIntro.AddListener(Show);
        bsm?.events.OnDeath.AddListener(Hide);
    }

    healthRef.events.OnHealthChange.AddListener(SetHealth);
}

void Update()
{
    if (healthCharacter == HealthCharacter.Boss)
    {
        if (OnScreen && rectTransform.pivot.x != 1)
        {
            rectTransform.pivot = Vector2.Lerp(rectTransform.pivot, new Vector2(1, 0.5f), 0.05f);
        }
        else if (!OnScreen && rectTransform.pivot.x != 0)
        {
            rectTransform.pivot = Vector2.Lerp(rectTransform.pivot, new Vector2(0, 0.5f), 0.05f);
        }
    }
}

void Show()
{
    OnScreen = true;
}

void Hide()
{
    OnScreen = false;
}
```

One hitch, though. The BSM OnIntro event was firing at the beginning of the
scene anyway. I was assured by Gino, the Boss pod leader that this would be
corrected by his team before the final build, so there was nothing else for me
to do.

## Credits Sequence

(about 6 hours)

Unfortunately, we didn't remember that the credits sequence even needed to be
done until the Sunday before the final build, so I had to get it built and do it
quick.

After my experience this semester fiddling with menu components in the editor, I
knew this was something we would want to build programmatically. Otherwise, we'd
be in a hell of searching game objects in scene, dragging to reorder, and
getting terrible merge conflicts. To that end, I decided to built this system
such that the list of people was input in code, then constructed at runtime.

The data is defined in a `Dictionary<string, List<string>>` for mapping team
name to all the team members' names. On start, the credit component iterates
through and appends to itself title and name prefabs, instantiated and updated
with the appropriate text. This allows for incredibly fast and easy updates to
the list.

```c#
private Dictionary<string, List<string>> credits = new Dictionary<string, List<string>> {
    { "Game Director", new List<string> {
        "Alex Kisil"
    }},
    { "Producers", new List<string> {
        "Amber Renton",
        "Nico Williams"
        }},
    // ...
};

void Start()
{
    foreach (KeyValuePair<string, List<string>> entry in credits)
    {
        createPair(entry.Key, entry.Value);
    }

    createNode(endPrefab);
}

void createPair(string title, List<string> names)
{
    createNode(titlePrefab).GetComponent<TMPro.TextMeshProUGUI>().text = title;
    foreach (string name in names)
    {
        createNode(namePrefab).GetComponent<TMPro.TextMeshProUGUI>().text = name;
    }
}

GameObject createNode(GameObject prefab)
{
    GameObject newObj = Instantiate(prefab);
    newObj.transform.parent = transform;
    return newObj;
}
```

Now that we have a long list of credits, we need to get through it all. The
first thought was to use Unity's scrollable view components to allow users to
have control over the scrolling pace. However, we hadn't implemented any
scrolling at this point, and early experimentation resulting in a cumbersome
interface that could be a pain to use for certain inputs. If this had been
something we had already explored, I would have kept at it, but having this
complex interactable component felt like feature creep on our already short
timeline.

Instead, I threw a mask component on the list parent to hide overflow, and
animated the top offset of the list. Fortunately for me, the layout components
already in place gave me a property of `preferredHeight`, so I knew exactly how
far they had to scroll. As per the programming style guidelines, I set out to
perform this scroll based on time deltas rather than throwing it in a
coroutine. For dramatic effect, I added an extra 2 seconds to the start and end
of the sequence. At the end of the scroll, I invoke an event so the menu system
can exit the credits.

```c#
public void StartScroll()
{
    goalPosition = GetComponent<UnityEngine.UI.VerticalLayoutGroup>().preferredHeight;
    startTime = Time.unscaledTime;
    scrolling = true;
}

void Update()
{
    if (scrolling)
    {
        if (rectTransform.anchoredPosition.y < goalPosition)
        {
            float t = (Time.unscaledTime - startTime - 2f) / (float)count;
            if (t > 0)
            {
                rectTransform.anchoredPosition = Vector2.Lerp(new Vector2(0,0), new Vector2(0, goalPosition), t);
            }
        } else if (finishTime == 0) {
            finishTime = Time.unscaledTime;
        }

        if (finishTime > 0 && Time.unscaledTime - finishTime > 2f)
        {
            OnComplete.Invoke();
        }
    }
}
```

## Miscellaneous

(about 4 hours)

* **Input map switching**. (1.5 hours) Since the issues mentioned in the last post about
  implementing the pause menu without a PlayerInput component, there have been
  some obnoxious loose ends with the menu behavior, like not being able to use
  the mouse and being able to interact with the player while paused. I spent
  some time tinkering around with this and was able to fix both of these
  issues by releasing the mouse lock and switching the PlayerInput action map
  upon pause.

* **Menu design considerations**. (2 hours) This sprint we finally gussied up the menu in
  the ways we'd been talking about doing from the beginning. This involved new
  typefaces, new art, and new layouts. I kept this in miscellaneous because my
  programming teammate did almost all the implementation of this, but we did
  some design by committee, so I was involved in several discussions, the search
  for typefaces, some consulting with the art team members over some scaling
  issues, and ultimately the code review.

* **Delaying actions for sound**. (15 min) There are sounds attached to every menu
  event. Previously, options like continue and new game would immediately call
  to the SceneManager, which would load the new scene and cancel the sound. Now,
  the actions are delayed long enough for the sound to play.

* **Tools teardown**. (15 min) Now that the semester is over, I had to shut down my
  recurring tools including the reminder bot and the daily auto-builder.

## Tools Documentation

(about 4 hours)

Nico had asked me a while ago to document the tools I had worked on, including
the mail server, the discord bot, and the autobuilder. I put them on the
backburner, which made this sprint time to collect.

I spent time cleaning up and adding comments to the scripts I had written, as
well as writing readme documents explaining the installation, set up,
limitations, and possible future solutions for each. There's not really much to
explain to this one, but I took a couple hours doing a brain dump for all the
tools I worked on.
