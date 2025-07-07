---
title: Hex Color Scales
description: Taking a look at ways to represent a number scale as colors along a gradient.
tags:
- hexadecimal
- programming
date: 2017-04-15
---

I recently created a [battery
module](https://github.com/shreve/dotfiles/blob/master/i3/_blocks/battery) for
my i3blocks bar. For this project, I wanted the icon to have a color
representing the fullness of the battery --- 100% green for full, 100% red for
empty, and gradients in-between. i3blocks renders text using
[pango](http://www.pango.org/) so it supports hexadecimal colors codes via an
HTML-like markup. The desired process can be outlined as:

1. Calculate the battery percentage (outside the scope of this article)
2. Calculate the desired level of red, green, and blue based on that percentage
3. Combine that rgb color into a hexadecimal color

## Calculating the RGB color

In my first attempt, I decided to try grading from 100% to 0% green, and 0% to
100% red as the battery percentage declined. This did result in the desired
bright green at full and bright red at empty, but the middle was a less
satisfying color.

```c
char * color_percentage(float percent) {
  int red = 255 * (1 - percent);
  int green = 255 * percent;
}
```

```
percent:  100 -------- 75 -------- 50 -------- 25 -------- 0
red:        0 -------- 25 -------- 50 -------- 75 ------ 100
green:    100 -------- 75 -------- 50 -------- 25 -------- 0
```

{{<posts/hex/bar width="35" v="1">}}

At 50%, both red and green were dimmed to 127, making for a murkey orange-brown
color. This didn't look right. Instead, I realized it should be bright yellow
in the middle. In rgb, yellow is (255, 255, 0). My scale would have to change
slightly. Instead of grading both colors at the same time, I'd want to grade
one color at a time, keeping green 100% on the top half, and red 100% on the
bottom half.

```c
char * color_percentage(float percent) {
  int red, green;
  if (percent > 0.5) {
    red = 255 * 2 * (1 - percent);
    green = 255;
  } else {
    red = 255;
    green = 255 * 2 * percent;
  }
}

```

```
percent:  100 -------- 75 -------- 50 -------- 25 -------- 0
red:        0 -------- 50 ------- 100 ------- 100 ------ 100
green:    100 ------- 100 ------- 100 -------- 50 -------- 0
```

{{<posts/hex/bar width="35" v="2">}}

This is much better. Each stage on the spectrum is quite bright, and a much
better color for a battery indicator. Now we have our desired colors, we just
need them in a format we can use.

## Calculating the hex color

RGB colors are a combination of 3 numbers between 0-255 to represent red,
green, and blue. While they don't look like it, hexadecimal numbers are the
same thing. The difference is that the numbers range from 0-FF. This is due to
the changed base. The ranges are the same, but hexadecimal is base 16.

### Changing the base

Typically, math is done in base 10. This means the rules that were taught from
a very young age apply. Start with 0, then 1, 2, 3, up to 9. Beyond 9, you
increase the tens' place and restart the ones' place, getting 10. This means
any number can be represented as a combination of the 10 base digits:

```c
int base_digits[10] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
```

In base 16, there needs to be 16 digits to choose from so we can have the same
results. Since we're out of unique numbers, we start using letters. The 16 base
digits in hexadecimal are:

```c
char base_digits[16] = {'0', '1', '2', '3', '4', '5', '6', '7',
                        '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'};
```

Now instead of counting to 9 before incrementing the tens' place, we get to F.
**This means there are 16 unique values that can be stored in the one's
place.** Converting to hexadecimal is just a matter of counting up the decimal
number into the wider base system.

### Performing the change

To convert, one could count up in both decimal and hexadecimal, but that is
time consuming, and there are much more effective ways to do the computation.
In fact, you don't even need to perform this computation at all. Most
languages, C included, have print formatters built in that will convert
integers into hex characters for you.

```c
char * color_percentage(float percent) {
  // ...
  char *out = (char *)malloc(7);
  sprintf(out, "#%02X%02X00\0", red, green);
  return out;
}
```

The key thing to look at here is the format string passed to `sprintf`. We
print the values of both red and green with the format `%02X`. This specifies a
few things:

1. The capital X means print in hex format with capital letters. A lowercase x
   means the same thing, but with lowercase letters.
2. The 2 before the x means to pad out to a 2-character width if the value ends
   up being less than 2 characters.
3. The leading 0 indicates any padding should use 0 as the pad character.

This results in the typical 7-character hex color definition you'd expect to see
in CSS/HTML, and in our case, pango.

Now we have an API that can produce some nice colors for a battery percentage
indicator!


{{< posts/hex/table >}}
