---
title: WolverineSoft Dev Blog
permalink: /wsoft
---

<section>
  <h1>WolverineSoft Devblog</h1>

  <p>This blog details my process of working for <a href="https://wolverinesoft-studio.itch.io/">WolverineSoft Studio</a> during the winter 2020 semester.</p>
  <ul class="blog-post-list">
    {% assign posts = site.wsoft | sort: 'date' | reverse %}
    {% for post in posts %}
    <li class="blog-post">
      <a href="{{ post.url }}">{{ post.title }}</a>
      {% if post.updated %}
      <span>Updated {% include date.html date=post.updated %}</span>
      {% else %}
      <span>{% include date.html date=post.date %}</span>
      {% endif %}
    </li>
    {% endfor %}
  </ul>
</section>
