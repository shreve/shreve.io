---
layout: post
title: "How to download large files on crappy connections with bash and curl"
date: 2014-06-12
tags:
  - bash
---

For some reason, my home internet connection has always been terrible, and seems like it always will be. That doesn't change the fact that I like the internet, and downloading things from it, like video games I purchased from [The Humble Bundle](https://www.humblebundle.com/). Until recently, I just dealt with the fact that I'd need to pay a visit to my local library or McDonald's to use their WiFi. No More!

Most of the time when a download interrupts in any of the major browsers, it cannot be resumed. You can use a download manager like [Folx](http://mac.eltima.com/download-manager.html) to get interruption-tolerant downloading, but I really like to avoid 3rd party software when possible. It turns out, the best downloading software was already installed in my terminal. The answer is `curl`!

From the Curl Manual:

```
-C, --continue-at <offset>

Continue/Resume a previous file transfer at the given offset.
The given offset is the exact number of bytes that will be
skipped, counting from the beginning of the source file
before it is transferred to the destination.

Use  "-C -" to tell curl to automatically find out
where/how to resume the transfer. It then uses the given
output/input files to figure that out.
```

So it's a matter of just repeating `curl -C - "url"` until the download finishes. I wrote a little script to do just this.

```bash
# Repeat a command until it finishes with exit code 0
keep-doing() {
  # set a default non-zero value
  export exit_code=1
  # time the operation
  #    repeat while the exit code isn't 0
  time while [ $exit_code -ne 0 ]
  do
    # run the passed in command
    $@
    # then grab the exit code of the last command
    export exit_code=$?
  done
}

download() {
  # keep downloading the file until it's 100% done
  # -O maintains the file name from the URL
  keep-doing curl -O -C - $@
}
```

Now downloading large files is as simple as

```bash
download http://example.com/large-file.zip
```

If the url you're trying to download includes an ampersand (`&`), bash will try to fork the process, and you'll get output like `[1] 45840`. You simply need to surround the url in quotes.

```bash
download "http://example.com/large-file.zip?var=value&ttl=123456789"
```

Enjoy!
