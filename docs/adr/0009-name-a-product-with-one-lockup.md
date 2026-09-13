# Name a product with one lockup

## Context

A Kairos tool names itself in three places: the sign-in, the sidebar plaque, and
the mobile top bar. Until 0.11.0 those three places did it three different ways,
and all three of them lived in this package.

The sign-in rendered `ICON + WORDMARK` at `min(190px, 70%)` and put the product
name under it as a `kairos-page-title`, Bebas at `24px`. The sidebar plaque
rendered the same artwork capped at `150px` and put the product name under it in
Epilogue `600`, `11px`, tracked caps. The top bar rendered the `icon` variant at
`32px` and put the product name beside it, in the same `11px` tracked caps but
styled from `kairos-topbar-brand` rather than from a class of its own.

Three compositions, three type treatments, three sizes of mark. Nothing related
them, so nothing could drift back together, and an app that needed a fourth
placement had three precedents to copy and no rule to follow. Paykit's control
plane took the fourth: it hand-placed the `- DARK` artwork on the inverted
plaque, which is the variant drawn for a dark page rather than for this plaque,
and wrote `Paykit control` underneath.

The sign-in composition has a defect the other two do not. `ICON + WORDMARK`
contains the word KAIROS. Setting the product name in Bebas under it puts two
display wordmarks in one column with no device joining them, so the screen opens
with three lines of branding before the tagline, and the vendor outranks the
product on the one screen where the reader already knows the vendor and does not
yet know which app they are in. The descriptor baked into that artwork is about
a `6px` cap height at `190px` wide and about `4px` on the sidebar plaque, which
is texture rather than information.

## Decision

A product is named by one object, in one composition, everywhere it is named:
the icon mark, a `2px` rule, then the product name in Bebas.

`ProductLockup` is that object. `AuthScreen`, `Sidebar` and `TopBar` render it,
which is what makes three screens open the same way, and an app reaching for a
fourth placement renders the same component rather than reading three
precedents.

Three properties carry the decision.

**The mark is the icon, never the full lockup.** One wordmark per surface. The
full `ICON + WORDMARK` stays a Brand Scale asset, for a website, an email
header, an invoice or a deck, where the reader may not know who Kairos is.
Inside a tool they do, and the icon carries it. A sign-in credits the company in
writing instead, once, through `kairos-auth-credit`, which `AuthScreen` renders
and no prop turns off. That is the copy rules' first mention, and it is why the
artwork no longer has to carry the company name.

**The product name is type, never artwork.** A new Kairos app ships its identity
by passing a string. Nothing is drawn, exported, or added to the CDN. That is
the property that keeps four apps from becoming four logos, and it is worth more
than any particular composition.

**Size comes from the context, not the call site.** There is no size prop, for
the reason `BrandLockup` has none. `--kairos-product-mark`,
`--kairos-product-rule` and `--kairos-product-name` default to the shell's
`28px` mark on the base class, and `.kairos-auth-header` raises them to `44px`.
A call site that writes a width overrides the stylesheet from a place the
stylesheet cannot answer.

The rule between the mark and the name takes `currentColor` rather than a token.
It is the one part of the object whose colour is not fixed, and following the
name is what lets the inverted sidebar plaque set `color` once and have the
whole object follow it onto the ink.

`kairos-sidebar-product` is removed rather than deprecated. It existed to style
a product name that is no longer a separate element, and leaving it in the
stylesheet leaves the old composition buildable.

The product name is the page's `h1` on the sign-in and a `span` everywhere else,
through `as`. The mark is not a heading, so without the `h1` a screen reader
opens the sign-in with nothing to announce. In the shell the heading is the page
title, not the app's name repeated back in the chrome.

One constraint moves onto the product names themselves: one word, ten characters
or fewer. The sidebar plaque has `196px` of usable width at
`--kairos-sidebar-w`, and a brand name that truncates is a different brand name.
Paykit, Mailkit, Uptime and Card all satisfy it. `Paykit control plane` did not,
which is how the control plane's sign-in became `Paykit` with the rest of it in
the tagline, and its plaque became `Paykit` with `Control plane` as the nav
group label.

The branding skill changes in the same release. Logo And Brand Blocks gains the
product lockup, the asset table stops saying to prefer the full lockup wherever
space allows, and the App Shell Contract's logo-block line describes one object
instead of a mark stacked over a name.
