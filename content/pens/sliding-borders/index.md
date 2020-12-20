---
title: Sliding Borders
date: 2020-12-19
height: 600px

---

This pen uses one rule set which can be inherited to create several different
components with the same visual style: a subtle color changing background.

The base style stretches the colored pseudo-element to cover the entire base
element, then moves it behind with `z-index`. Combined with a background color
on the base element, this creates the thin border of the code block (notice
`pre` only sets a background and spacing).

Alternatively, the `blockquote` and `a` elements resize the pseudo-element for
other effects. This is acheived by changing the sizing options on the
`::before` selector.

One thing to note is the importance of the definition of the `linear-gradient`.
In order to get the image to tile properly at a 45deg angle, you need to supply
the color list as indicated---`($colors, $colors, $first)`. Ending with the
first ensures that it wraps around correctly, and including two copies of the
list makes sure the ends line up when tilted.
