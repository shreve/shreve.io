---
layout: page
permalink: page.url
---

<article itemscope itemtype="http://schema.org/BlogPosting">

<meta itemprop="author" content="Jacob Evan Shreve" />
<meta itemprop="publisher" content="Shreve Industries" />
<meta itemprop="inLanguage" content="en-US" />
{% if page.image %}
  <meta itemprop="image" content="{{ page.image }}" />
{% endif %}

<header>
  <h1 itemprop="name headline">{{ page.title }}</h1>

  <div class="content-element">
    <span class="timestamps">
      {% include date.html date=page.date prop='datePublished' %}
      {% if page.updated %}
      ; updated {% include date.html date=page.updated prop='dateModified' %}
      {% endif %}
    </span>
    <br>
    {% if page.tags != empty %}
      <ul class="tags" itemprop="keywords">
        {% for tag in page.tags %}
        <li>{{ tag }}</li>
        {% endfor %}
      </ul>
      </span>
    {% endif %}
  </div>
</header>

<div itemprop="articleBody text">{{ content }}</div>
</article>
