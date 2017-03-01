---
title: Recipes
permalink: /recipes/
---

I like to keep a few of my favorite recipes handy.

Keep in mind that I grew up in the Midwest, <br>
so these may clog your arteries and kill you.

{% assign recipes = site.recipes %}
{% for recipe in recipes %}{% if recipe.title != page.title
%}<li><a href="{{ recipe.url }}">{{ recipe.title }}</a></li>{% endif %}
{% endfor %}
