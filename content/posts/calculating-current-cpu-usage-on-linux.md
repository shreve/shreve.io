---
title: Calculating current CPU usage on Linux
description: Learn to calculate the active time of your CPU using a simple bash script
tags:
- linux
- bash
date: 2017-09-28
---

**tl;dr:** [The code](#the-code)

I use a tool called i3blocks to script my own status bar, which includes a CPU usage indicator.
Recently, I noticed something odd about it. The output would change for a while, but eventually
stick right around 41%. I had previously just copied this script from Stack Overflow, so I decided
it was time to dig in and learn about this in order to fix it.

I was able to relocate the Stack Overflow question I had taken the script from:
[How to get overall CPU Usage (e.g. 57%) on Linux](https://stackoverflow.com/questions/9229333/how-to-get-overall-cpu-usage-e-g-57-on-linux)
The answer I had chosen is the highest rated, and relies on `/proc/stat`.

```bash
grep 'cpu ' /proc/stat |
awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage "%"}'
```

It reads in the fields from `/proc/stat`, which breaks down the time spent on each task by your CPUs.
In particular, this `grep` looks for the aggregate of all your cores. The numbered inputs correspond
as `$2` = user tasks, `$4` = system tasks, and `$5` = idling. Awk then prints the division of combined
time spend working (user + system) by the total time (working + idling). This percentage is the answer
I was looking for.

The problem with this approach is that `/proc/stat` is a record of everything since startup. That's why
the output kept leveling off --- the more inputs you have, the harder it is to move the average. With
this approach out, I moved to the next answer.

```bash
top -bn1 | grep "Cpu(s)" | \
           sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | \
           awk '{print 100 - $1"%"}'
```

This answer uses the popular tool, `top`, which pulls together a lot of statistics about activity
on one's computer. This script generates a single page of top, looks for the line about CPU usage,
parses out the idle time, then returns the inverse (`100 - $1`).

This script suffers from the same problem as the previous answer --- the idle time is an accumulated
amount since boot time. That combined with the fact that it generates a lot of other statistics, this
seems like a worse option. However, there is more to this than meets the eye.

Using top in this manner will always give you a "since boot" measurement first, but if you generate
2 pages by changing the source to `top -bn2`, the second page will include a measurement since the
first page was generated, which is the time period we're looking for.

```bash
top -bn2 | grep "Cpu(s)" | \
           sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | \
           awk '{print 100 - $1"%"}' | \
           tail -1
```

This now gives the answer I wanted, but it takes a while, and is a bit heavy. It generates two full
pages of top statistics and has a waiting period in-between. I decided to press further.

```bash
mpstat | awk '$12 ~ /[0-9.]+/ { print 100 - $12"%" }'
```

The several remaining answers use `mpstat`, and none of them worked for me --- they all report 100%.
This is due to a column mismatch. The awk command is trying to return 100 - idle time like the `top`
command, but the number of column in my version differ, to it's pulling `%gnice` instead of `%idle`.
As far as I can tell, this mpstat approach is practically identical to the `top` approach.
¯\\_(ツ)_/¯


With all these contenders not meeting my standards, I realized I was going to need to use more than
ctrl+c, ctrl+v. I like that `top -bn2` gives the delta between when the two samples were taken, but
there's not really a way to get around the wait period. I like that `/proc/stat` is just a file to
read from and not a command to run extra cycles to compute. It also has the strength of providing
the source data. Using this, I realized I can calculate the value I want quickly by just using a temp
file.<a name="the-code">&nbsp;</a>


```bash
# Write the current state to a temp file
save_current() {
    grep 'cpu ' /proc/stat > /tmp/cpustat
}

# If the temp file doesn't exist, save it now.
# This means the current reading will be pretty inaccurate,
# usually too high, because it measures CPU usage from now
# until 2 lines later in this program.
[ ! -e /tmp/cpustat ] && save_current

# Load the previous state from the temp file, and capture
# the current output.
previous=$(cat /tmp/cpustat)
current=$(grep 'cpu ' /proc/stat)

# Define the awk script to parse the two lines of input.
# For the first line (NR == 1), save the values.
# For subsequent rows (NR > 1), calculate the difference
# between this line and the first line and calculate the
# total average percentage.
awkscript='NR == 1 {
             owork=($2+$4);
             oidle=$5;
           }
           NR > 1 {
             work=($2+$4)-owork;
             idle=$5-oidle;
             printf "%.1f%", 100 * work / (work+idle)
           }'

# Execute the awk script against the two lines of input
# and save the string.
usage=$(echo -e "$previous\n$current" | awk "$awkscript")

# Save the current value. The next time you run this script
# will calculate average usage since this line was run.
save_current

echo "$usage"
```

This solution is very fast, and gives a pretty accurate measurement of the current CPU usage.

**Note:** The output of `/proc/stat` contains data for each core of your
processor (e.g. `cpu0`, `cpu1`, ...) as well as the combination of all of them,
`cpu`.  The space in the grep query `'cpu '` is intentional to grab only the
aggregate line. Omitting this space will give you a lot of percentages: two
times the number of cores, plus one. If you instead want the usage of each core,
this should be a good starting point, but myself and I think most readers only
want the overall usage.

```
Lenovo Thinkpad Carbon X1, 4th gen
Ubuntu 17.04
Kernel 4.10.0-35-generic
sysstat 11.4.3
```
