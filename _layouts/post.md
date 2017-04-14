---
layout: page
permalink: page.url
---

<article>
<header>
<h1>{{ page.title }}</h1>

<div class="content-element">
<time datetime="{{ page.date }}">
{% assign day = page.date | date: "%-d"  %}
{% case day %}
  {% when '1' or '21' or '31' %}{{ day }}st
  {% when '2' or '22' %}{{ day }}nd
  {% when '3' or '23' %}{{ day }}rd
  {% else %}{{ day }}th
{% endcase %}
{{ page.date | date: "of %B, %Y" }}
</time>
<br>
{% if page.tags != empty %}
<ul class="tags">
{% for tag in page.tags %}
<li>{{ tag }}</li>
{% endfor %}
</ul>
</span>
{% endif %}
</div>
</header>


{{ content }}
</article>
