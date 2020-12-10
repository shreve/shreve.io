---
title: Fixing xbacklight
tags:
- linux
- X11
- backlight
date: 2017-03-16
---

I recently decided to upgrade from Ubuntu 16.04 LTS to 16.10. This was unfortunate for a couple reasons: 1. The upgrade broke some dependencies leading to `apt` no longer working and 2. I made the decision at midnight on a worknight.

I ended up reinstalling 16.04 and trying to restore a backup of my home folder. In this process, I ended up breaking plenty of my configuration. The most frustrating of which was the breaking of `xbacklight` for backlight control. Before the reinstall, `xbacklight` worked perfectly. Now, it returned a frustrating error: **"No outputs have backlight property"**

I knew this wasn't true because it worked before, but I didn't know what exactly was wrong, so I explored several options.

1. **Modifying kernel parameters** -- Adding parameters like `acpi_backlight=vendor` to grub to somehow change ACPI behavior on boot. This never changed anything as far as I could tell, and was annoying to test because it required restarting.
2. **Adding a line to xorg.conf** -- Adding "EnableBrightnessControl=1" to a device section of an xorg config file. This also never seemed to do anything at all.
3. **Writing to `/sys/class`** -- One can change their brightness by writing to the brightness file in `/sys/class/backlight/intel_backlight`, but this requires root permissions, and doesn't fix`xbacklight`, the basis of my backlight control config.

Ultimately I found a [debian bug page](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=833508) that led to my result. The problem exists in an updated x/video package. What I needed was `xserver-xorg-video-intel`, but what I had was `xserver-xorg-core`.

According to this bug report, someone was able to force rollback to `xserver-xorg-video-intel` by creating the following file:

```config
/usr/share/X11/xorg.conf.d/10-backlight.conf

Section "Device"
	Identifier "Intel"
	Driver "intel"
#	Option "AccelMethod" "uxa"
EndSection
```

And indeed it worked for me too. I created this file and rebooted, and `xbacklight` worked again!


```
Lenovo Thinkpad Carbon X1, 4th gen
Ubuntu 16.04 LTS
Kernel 4.8.0-41-generic
xbacklight 1.2.1
```
