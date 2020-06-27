---
title: Creating a website theme that respects user preference
date: 2020-06-27
tags:
- CSS
- Sass
---

A neat website theming option I've seen used more frequently lately is the use
of the `prefers-color-scheme` media query. It allows the user's browser to
specify if they want a `light` or a `dark` theme, or if they have
`no-preference`. If the user went through the trouble of requesting a theme, you
might as well give it to them, right? Here's what I came up with to do that.

The starting point for this was honestly some really bad Sass written years ago,
but for the sake of explanation, let's say it was some plain CSS with a theme
class. Everything gets some default styles, then descendents of a `.dark-theme`
class get some different colors.

```css
body {
    color: #222;
}

a, a:visited {
    color: #0000FF;
}

/* etc ... */

.dark-theme {
    color: #DDD;
}

.dark-theme a, .dark-theme a:visited {
    color: #35C0FF;
}

/* etc ... */
```

Alongside this, I had written some javascript for a manual toggle which adds or
removes the class, then remembers the user's choice for the next pageload.

In order to implement the user preference, the style rule sets need to be scoped
with media queries rather than classes.

```css
@media (prefers-color-scheme: light) {
    body {
       color: #222;
    }

    a, a:visited {
       color: #0000FF;
    }
}

@media (prefers-color-scheme: dark) {
    body {
        color: #DDD;
    }

    a, a:visited {
        color: #35C0FF;
    }
}
```

The problem is that these two approaches can't be nicely combined without
repeating ourselves, which we don't want to do in CSS. Selectors are cheap, but
declarations can add up. In a typical programming language, we could combine
these ideas with an or operator.

```python
if selected_theme == "dark" or
   (selected_theme == null and preferred_theme == "dark"):
    # Apply dark theme
else:
    # Apply light theme
```

There is no way to achieve this in CSS without repeating all the contained
definitions. You can't combine unscoped selectors with media-scoped selectors.
We want the dark theme styles to be applied when the `.dark-theme` class is
present, _or_ when no theme class is present but the `prefers-color-scheme:
dark` attribute is set. The syntax just doesn't allow for this.

Fortunately, we can get by without repeating ourselves too much with the
addition of CSS-native variables. Using these, we only have to repeat the
variable declarations and not necessarily the rules.  We can set the variable
values within the scope of a selector and that value will be applied to all the
rules defined elsewhere.

```css
:root {
    --link-color: #0000FF;
}

@media (prefers-color-scheme: dark) {
    :root {
        --link-color: #35C0FF;
    }
}

.dark-theme {
    --link-color: #35C0FF;
}

a, a:visited {
    color: var(--text-color);
}
```

This allows a more clear separation where the rule sets you write don't need to
be aware of the currently activated theme. It also provides the benefit of less
repetition, especially if theme values are used in more than one declaration.

Of course, this gets a bit repetitive to manage, having to maintain the values
in separate places. The ideal solution would only store each value in one place.
I decided to keep a copy of each variable for each theme, and within the
selectors assign the namespaced variable to the global one. This final version
uses Sass to help automate away some of the assignment.

```sass
\:root
  // All your theme variables for light and dark modes
  --lm-text-color: #222
  --lm-subtext-color: #666

  --dm-text-color: #DDD
  --dm-subtext-color: #AAA

// List the props to include
$theme-props: text-color, subtext-color

// Map the theme namespaced variables to un-namespaced
@mixin select-theme($theme)
  @each $prop in $theme-props
    --#{$prop}: var(--#{$theme}-#{$prop})

// This is what defines the default theme
\:root
  @include select-theme(lm)

// Set the theme based on the media selector if present
@media (prefers-color-scheme: dark)
  body
    @include select-theme(dm)

// By applying a class, you override the default based on the media selector
// Use this in response to a user selection to switch/set the theme
.dark-theme
  @include select-theme(dm)
```

(As a note, a [Sass map](https://sass-lang.com/documentation/values/maps) would
be a better fit for this job, but I'm using GitHub pages, which doesn't support
the latest dart Sass features.)

With this system, it's now trivial to replicate theme values between the
multiple selectors. You can support the user-provided preference by default,
then manually switch by adding class names. Don't forget to consider the
`no-preference` condition. This will be the default for most users as this
condition isn't always set even if it is supported.

That was the hard part. Next comes writing some javascript to apply the theme
classes as needed and remember user choices between pages. I'll leave that as an
exercise for the reader because it could be done in so many different ways to
suit your requirements, but I'll give you a helpful API hint.

On page load, you'll want to know which theme has been applied based on the
media query, if any. As far as I am aware, there's no way to ask what the
preference is, but you can ask whether the preference is a certain value.

```js
window.matchMedia('(prefers-color-scheme: dark)').matches
// => true or false
```

Once you find the value that returns `true`, you'll know what theme is currently
showing.

Good luck, and happy theming!
