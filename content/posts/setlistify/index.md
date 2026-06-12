---
title: 'From setlist.fm to Spotify: Build Playlists from Live Shows'
description: Make Spotify playlists from concert setlists in seconds. Setlistify pulls setlist.fm data, fuzzy-matches tracks to Spotify, and creates shareable playlists — no manual searching.
date: '2025-06-01'
draft: false
slug: '/blog/setlistify'
tags:
  - Python
  - MCP
  - Open Source
  - Music
---

My wall is covered in concert tickets. Iggy Pop, Guns N' Roses, The Offspring, Pulp, Judas Priest, Rammstein, Iron Maiden — I've been collecting them since I was a teenager, and at this point there's barely space left. This year's season opened with Metallica.

Every time I get back from a show, I want that setlist as a playlist. Relive the night, share it, keep it. But searching every song on Spotify manually takes 20 minutes, I'd forget half of them, and I'd end up just... not doing it. Years of setlists I never saved.

So I built [**setlistify**](https://github.com/emarkou/setlistify) — an MCP server that connects setlist.fm and Spotify, and lets you create playlists from live concert setlists by just asking Claude in plain English. I type:

> Make me a playlist from Metallica's last show

and I have a Spotify link in seconds.

## What it does

Tell Claude which artist and show you want. Setlistify will:

- Fetch the real setlist from [setlist.fm](https://setlist.fm) (filter by year, city, or venue)
- Search Spotify for every track and handle fuzzy matching for live variants, alternate titles, and common misspellings
- Create the playlist on your Spotify account and return a shareable URL
- Provide a quick summary: matched vs. unmatched tracks, with an option to review misses

## How it works

- Uses the setlist.fm API to retrieve setlists and metadata (date, venue, city)
- Queries Spotify's search API with fuzzy matching and heuristics for live versions, medleys, and alternate titles
- Uses OAuth to add tracks to your Spotify account and create the playlist automatically

## Tools

Setlistify exposes three primary tools:

**`get_setlists`** — Browse recent setlists before committing to a playlist. Supports filtering by year, city, and venue.

**`create_playlist_from_setlist`** — The main tool. Two modes:

- `latest` — Create a playlist from the most recent show for an artist
- `best-of` — Aggregate top-played or fan-favourite tracks across multiple recent shows into a single playlist

**`diff_setlist_vs_discography`** — Compares the last 10 setlists against the artist's full Spotify catalogue. Returns songs they always play, songs they've never played live, and rarities (played only once in the window).

## Why it's useful

- **Save time**: what used to take 20 minutes per show becomes a few seconds
- **Accuracy**: fuzzy matching reduces missed tracks for live versions and alternate titles
- **Memory & sharing**: turn ticket-wall memories into shareable Spotify playlists
- **Aggregate and curate**: build "best of" playlists from multiple shows without hunting down each song

## Try it

See the code and setup instructions on [GitHub](https://github.com/emarkou/setlistify). Clone the repo, follow the README to configure setlist.fm and Spotify credentials, and start converting setlists with a natural-language prompt.

Got a wall of tickets and no time? Try:

> Make me a Spotify playlist from Metallica's last show

## What's next

- Venue history mode — all setlists from a specific venue, useful for residencies
- Tour comparison — how does the current tour setlist differ from the last one
- Apple Music support — same logic, different API
