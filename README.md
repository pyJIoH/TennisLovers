# Court Notes

A tennis website for coaches and players: technique, tactics, training and advice.
It is a [Jekyll](https://jekyllrb.com/) site, which GitHub Pages builds and hosts for free.

Live site (once Pages is switched on): https://pyjioh.github.io/TennisLovers/

## Switch on GitHub Pages (one time)

1. Open the repo on GitHub, then **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Pick branch **main** and folder **/ (root)**, then **Save**.
4. After a minute or two the site is live at the address above.

## Add a new guide

Every guide is one Markdown file in `_guides/<section>/`.
The file name becomes the address: `_guides/technique/kick-serve.md` → `/technique/kick-serve/`.

Copy this into a new file and fill it in:

```markdown
---
title: The kick serve
section: technique          # technique, tactics, training, mental or coaches
topic: Serve                # one of the topics listed for that section in _data/sections.yml
level: Advanced             # Beginner, Intermediate, Advanced or All levels
order: 5                    # position within the section (lower comes first)
summary: One or two sentences shown on cards and in search results.
tags: [serve, kick, spin]   # extra words that help search find it
key_points:
  - First key point.
  - Second key point.
# Optional:
# image: /assets/images/kick-serve.jpg
# image_caption: Short caption under the image.
# videos:
#   - title: Video name
#     url: https://www.youtube.com/watch?v=...
# books:
#   - title: Book name
#     author: Author name
#     url: https://...
---

## First heading

Write the guide here. Each `##` heading appears in the "On this page" list.
```

The guide appears automatically on its section page, in search, and in previous/next links.
Until `videos` or `books` are added, the guide shows a "links coming later" note.

The sample guides in `_guides/` are short placeholders written to show the layout. Replace them with your own material.

## Images

Put pictures (for example scans or photos) in `assets/images/` and point to them with `image:` in a guide,
or inside the text with `![Description](/TennisLovers/assets/images/name.jpg)`.

## Change the menu or topics

Edit `_data/sections.yml`. Each section has a title, an intro line and a list of topics.
The site name and tagline are in `_config.yml`.

## Look and feel

All styling is in `assets/css/style.css`. Colors and fonts are defined at the top, under `:root`.

## Preview on your computer (optional)

With Ruby installed:

```sh
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000/TennisLovers/.
