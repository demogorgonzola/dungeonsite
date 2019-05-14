---
title: Crate Trimmer Algorithm
date: 2019-05-12T14:06:33-06:00
draft: false
---

What is the most efficient width a container can pack it's elements under the
constraints that...

* Elements are atomic
* Elements retain their order
* Container height is immutable

Algorithms under these conditions have the strong possibility of being greedy.
Reasoned since the first obvious, though aproximal solution, is to do a binary
search between the non-atomic optimal width and the given container width with
a non-decimal delta threshold (1px).

Notes:

* Some elements can surpass the given container width and will therefore
surpass the shortest possible width. This case only appears when the a screen
is too small to display a Element atomically. This can considered undefined
behavior, but making the algorithm more robust may be worthwhile.
* The number of rows under the given width, i.e. a function of height, is
present in all current solutions and may be integral all solution, but hasn't
been proven to be required.
