---
title: Obfuscating your email on the web
date: 2020-08-06
tags:
- cryptography
- privacy
- obfuscation
---

I really like having my email address publicly available on my website. Email is
a great medium for feedback or discussions about the articles I post here, and
making it accessible increases the chance readers will think to reach out with
it. The problem is, I don't like getting email from robots, and that is an
inevitable consequence of this publicity.

The solution to this is to not include my email address in the plaintext of the
page, but to instead dynamically provide it to the user when they ask for
it. Cloudflare has a tool for this called [Scrape
Shield](https://support.cloudflare.com/hc/en-us/articles/200170016-What-is-Email-Address-Obfuscation-),
which hides sensitive info in the HTML of the page and injects it back in after
it's loaded in the visitor's browser using javascript. This prevents basic bots
from scraping one's website for contact information. The problem with this
solution is that their scheme is easily broken, and it's widespread use makes
breaking it valuable. I'll show you.

If I am still using Cloudflare as you are reading this, you can cURL this page
and you'll find an obfuscated address below:

myname@example.com
<!-- If this isn't obfuscated, I probably moved or disabled their protections. -->

In a browser, you wouldn't notice that this doesn't say
<!--email_off-->myname@example.com<!--/email_off--> but the returned HTML should
instead include the following encoded email and a script to decode it.

```html
<a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="cfa2b6a1aea2aa8faab7aea2bfa3aae1aca0a2">[email&#160;protected]</a>
<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script>
```

The script is minified, but it doesn't take much work to decipher what it does.

1. Find all links with class `__cf_email__` and grab their `data-cfemail`
   attribute.
2. Take the first hex byte from that string (e.g. `cf`) and save as a key.
3. Iterate through the remaining hex bytes and XOR against the key.
4. Replace the link element with the result of this operation. If the original
   use was in a link already, it performs some extra work to replace the href
   attribute and include a `mailto:` prefix.

This means the values of emails can be extracted with a minor amount of work
after being scraped. Everything needed to decode the email is right there once a
spammer knows what to look for. To further illustrate this, I wrote a decode
script in Ruby:

```ruby
def decode_cf(orig)
    # Split out the first byte to act as key
    key, val = orig[0..1].hex, orig[2..].hex

    # Collect bytes from the end of val XORd with key
    bytes = []
    while val > 0 do
        bytes.push((val & 255) ^ key)
        val >>= 8
    end

    # Reverse the bytes and turn into a string
    bytes.reverse.map(&:chr).join
end

decode_cf("cfa2b6a1aea2aa8faab7aea2bfa3aae1aca0a2")
# => "myname@example.com"
```

I haven't investigated this further, but I suspect the use of `0xCF` as a key
isn't a coincidence.

As far as I know, this scraping hasn't been done at any mass scale, but the fact
that it could makes me unhappy.

Another approach to take would be to remove the email information from the HTML
altogether and place it into the site's javascript bundle. While looking into
this, I saw this option used in a lot of websites. Buried somewhere deep in an
obfuscated and uglified javascript bundle, a click event listener sets the
window location to `"mailto:myname@example.com"`. This option is nice because it
requires scrapers to not only download your webpage, but also your 10 megabyte
js bundle (I believe that's called security through inconvenience). In all
seriousness, this also leaves your plaintext email free to be plucked up by
anyone with malicious intent who thinks to download your js.

Similarly, a few years ago I used to include my email, but reversed, and do the
same thing by re-reversing it to get the correct result. I just kept imagining
it still getting scraped up because even in reverse it still looks like an
email. At some point in the future, it could then get corrected by a human
working on the project. It worked alright, but my paranoia couldn't let it be.

I'm writing this article today because I finally decided on and implemented a
solution I'm happy with for providing my email address to as few non-humans as
possible. It was inspired by [this post on Zibri's
blog](http://www.zibri.org/2015/10/tp-link-configuration-file-encrypt-and-decrypt.html)
about TP-LINK router configuration.

At least for a certain generation of TP-LINK routers, there was a feature to
export and reimport your configuration. TP-LINK intended for this to be for
backup only, rather than allowing users to upload arbitrary config files, as
evidenced by the fact that the file format is encrypted. Fortunately for
skiddies like myself, real hackers like Zibri exist to reverse-engineer the
encryption. Zibri figured out that TP-LINK used DES encryption in ECB mode with
a fixed key. As this is just a cool hack and not really worth any money, they
put up this post with a tool to perform the decryption and re-encryption so that
anyone could modify their config as desired. However, they didn't just put
everything up publicly. To protect their work and street cred, they deployed
some obfuscations.

The most important obfuscation is that they didn't include the encryption
key. Instead, they included the key *XORd with the domain of their
website*. This meant that running on their domain was integral to the decryption
process and that no one else could copy their code to another site and have it
work. It became impossible to copy without understanding this and deriving the
real key.

In a way, I want to do the same thing with my email address. I want a link to my
address which only works when being executed by a browser live on my site and
not in some context where it's been scraped and investigated later. I can
accomplish this by only publishing my address XORd with the domain of my
site. Here is the javascript I wrote to accomplish this:

```javascript
// Get a list of character codes as bytes from a string
const bytes = (str) => {
  return str.split('').map((c) => c.charCodeAt(0));
}

// Convert a list of bytes into a string
const str = (bytes) => {
  return bytes.map((b) => String.fromCharCode(b)).join('');
}

// Perform an XOR of two byte lists (length limited by b1)
const byte_xor = (b1, b2) => {
  return b1.map((b, i) => { b ^ b2[i] });
}

// The bytes required to produce my email address
const ebytes = [25,  9, 17, 10, 20, 37, 93, 1,
                29, 22, 30, 23, 75, 31, 10];

// If there is an email link on this page
let emailLink = document.getElementById('email');
if (emailLink) {

  // When a user clicks it
  emailLink.addEventListener('click', (e) => {
    e.preventDefault();

    // Get the hostname and repeat as needed for length
    let host = location.hostname;
    while (host.length < ebytes.length) { host = host + host; }

    // XOR the host with ebytes
    let email = str(byte_xor(ebytes, bytes(host)))

    // And send an email to the result
    window.location = "mailto:" + email;
  });
}
```

The `ebytes` value for your own email address can be generated by running the
following in the developer console on your website.

```javascript
byte_xor(bytes("you@example.com"), bytes(location.hostname))
```

This solution prevents the possibility of my email being scraped in plaintext,
but in reality, a scraper could still just visit my site with selenium or some
other javascript-enabled headless browser, find the link with the word "email"
and click it to get the address. To really get the kind of protection from
robots I want, I'd need to implement recaptcha or something like that, but
that's just too much. At that point, it becomes too large a burden on real
readers and works against my cause of getting people to reach out. This option
reaches just the right balance of security and convenience for me.

Also it's some neat crypto and I'm a geek for that kind of stuff.
