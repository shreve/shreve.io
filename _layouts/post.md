---
layout: page
permalink: page.url
---

<article>
<header>
<h1>{{ page.title }}</h1>

<div class="content-element">
<span class="timestamps">
    {% include date.html date=page.date %}
    {% if page.updated %}
    ; updated {% include date.html date=page.updated %}
    {% endif %}
</span>
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
