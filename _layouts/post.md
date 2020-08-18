---
layout: page
permalink: page.url
---

<article itemscope itemtype="http://schema.org/BlogPosting">

<meta itemprop="author" content="Jacob Evan Shreve" />
<meta itemprop="publisher" content="Shreve Labs" />
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
      <span>
      <ul class="tags" itemprop="keywords">
        {% for tag in page.tags %}
        <li>{{ tag }}</li>
        {% endfor %}
      </ul>
      </span>
      <br>
    {% endif %}

    {% assign time = content | number_of_words | divided_by: 220.0 %}
    {% assign unit = "minute" %}
    {% if time < 1 %}
    {% assign time = time | times: 6 | round | times: 10 %}
    {% assign unit = "second" %}
    {% else %}
    {% assign time = time | round %}
    {% endif %}

    <span>About a{% if time == 11 or time == 8 %}n{% endif %} {{ time }} {{ unit}} read</span>
  </div>
</header>


<div itemprop="articleBody text">{{ content }}</div>

<footer class="post-footer">
<h6>Join the discussion</h6>
<ul>
    <li>I'd love to hear your thoughts.</li>
    <li><a href="{% if page.tweet %}{{ page.tweet }}{% else
    %}https://twitter.com/_shreve{% endif %}" target="_blank">Reply on Twitter</a></li>
    <li><a href="#" class="email">Reply via Email</a></li>
    {% if page.hn %}
    <li><a href="{{ page.hn }}">Reply on Hacker News</a></li>
    {% endif %}
</ul>
</footer>
</article>
