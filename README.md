## Overview
The AArcade Metaverse is the next exciting step forward to the **portable shared shortcut library & 3D desktop** concept that was realized over Anarchy Arcade's long 5+ years of development.

The metaverse is where communities or individuals curate their vast media & shortcut collections into functional shared 3D desktops.

By abstracting the metaverse from any particular game engine or platform, users & developers are now able to tap into the metaverse from state-of-the-art engines for countless years to come.

## Frontend Integration
The AArcade Metaverse is designed to easily be integrated into any game engine that is capable of running a windowless web browser tab.

As a user, this means that you'd be able to build your 3D desktops in an Unreal 4 map just as easily as you'd be able to build them in a Source engine map.

As a developer, your frontend only needs to be able to send & receive JavaScript messages with the metaverse tab to tap into its power.

## Online Usage
The online features of the metaverse are powered by Firebase.com and written in JavaScript.

Anybody can setup their own Firebase.com account and host an online metaverse that is completely separate from my default server.

Conversely, multiple frontends spanning many different game engines can all share an individual metaverse as well.  This is all thanks to the metaverse's portable, cross-platform design.

## Offline Usage
A local & completely private metaverse can also be utilized in offline mode.  Just give the AArcade Metaverse a JSON object representing the initial state of the database, and it will start functioning as if it were a regular session.

## Hybrid Online/Offline Usage
Online metaverses censor local file paths for privacy reasons and therefor work best with URI's as opposed to local file shortcuts.

Offline metaverses are free to retain full local file paths, making them work equally well for both local file shortcuts & URIs.

Hybrid online/offline metaverses allow the best of both worlds.  They use your offline metaverse to locally fill in the holes in the online metaverse data.  This allows for both local file shortcuts & URIs to work equally as well, even from what is perceived to be an online session.

## Portability
The metaverse is portable every step of the way.

Shortcuts to local files work for your friends even if they don't have the same version of the file as you, or if they have it installed in a different directory.

The library that you create in one frontend can easily be accessed from a completely different frontend.

This means the epic library you've built in AArcade: Source can follow you to AArcade: Unreal 4, for example; extending the life of your creation even further.
