# 02 — Components

Markup below preserves every existing id, class and behavioural hook from `index.html` and
`src/main.ts`. Where an element is new, it is additive.

## Masthead

```html
<header class="masthead">
  <p class="eyebrow">Your quiet reading queue</p>
  <h1>Laters<span class="wordmark-stop">.</span></h1>
</header>
```

```css
.masthead { padding: 3rem var(--gutter) 1.625rem; }

.eyebrow {
  margin: 0 0 1.125rem;
  font-size: 0.6875rem; font-weight: 700;
  letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--text);
}
.eyebrow > span {                 /* the lime chip */
  background: var(--accent);
  padding: 4px 8px;
  border-radius: var(--r-chip);
}

h1 {
  margin: 0;
  font-size: clamp(3.25rem, 17vw, 4.875rem);
  font-weight: 800; letter-spacing: -0.06em; line-height: 0.8;
}
.wordmark-stop { color: var(--accent-ink); }
```

The intro line **"Save the link. Read it when you have the space."** is removed from the
populated screen at the maintainer's request. Keep the string available if it is ever wanted on
the empty state.

## List heading row

```html
<div class="list-heading-row">
  <h2 id="list-heading" tabindex="-1">Saved articles</h2>
  <p id="item-count" class="item-count" aria-live="polite">5 items</p>
</div>
```

```css
.list-heading-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--gap);
  padding: 0.75rem var(--gutter) 1rem;
}
#list-heading {
  margin: 0;
  font-size: 0.75rem; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--text-meta);
}
.item-count {
  margin: 0; flex: none; white-space: nowrap;
  padding: 4px 11px; border-radius: var(--r-pill);
  background: var(--accent); color: var(--text);
  font-size: 0.78rem; font-weight: 800; letter-spacing: 0.04em;
}
```

The section kicker "Newest first" is dropped — the heading row is doing enough, and ordering is
never in question in a five-item list. Restore it as a third element if you disagree.

## Article row

```html
<li class="article-row" data-item-id="…">
  <div class="article-content">
    <a class="article-link" href="…" target="_blank" rel="noopener noreferrer">
      Title<span class="visually-hidden"> (opens in a new tab)</span>
    </a>
    <p class="article-meta">Saved 2h ago</p>
  </div>
  <button class="delete-action" type="button" aria-label="Delete “Title”">…icon…</button>
</li>
```

```css
.article-row {
  display: flex; align-items: center; gap: var(--gap);
  padding: var(--row-y) var(--gutter);
  border-top: 1px solid var(--hairline);
  transition: background-color 200ms ease;
  overflow: hidden;                 /* required for the collapse */
}
.article-row:hover { background: var(--surface-hover); }

.article-content { flex: 1; min-width: 0; }

.article-link {
  display: inline-block; max-width: 100%;
  overflow-wrap: anywhere; text-wrap: pretty;
  color: var(--text);
  font-size: 1.09rem; font-weight: 600;
  letter-spacing: -0.014em; line-height: 1.32;
  text-decoration: none;
  /* the marker pen: a lime block that wipes in from the left */
  background: linear-gradient(var(--accent), var(--accent)) 0 90% / 0% 36% no-repeat;
  transition: background-size 300ms cubic-bezier(.3,.9,.3,1);
}
.article-link:hover,
.article-link:focus-visible { background-size: 100% 36%; }

.article-meta {
  margin: 0.5625rem 0 0;
  color: var(--text-meta);
  font-size: 0.6875rem; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase;
}
```

Note the marker also fires on `:focus-visible`, so keyboard users get the same affordance as
pointer users, on top of the focus ring.

## The X control

The visible disc is 30px; the touch target is a 44px pseudo-element. This is the one place the
design and the 2.75rem rule appear to disagree — they do not, the target is just invisible.

```html
<button class="delete-action" type="button" aria-label="Delete “Title”">
  <span class="delete-icons">
    <svg class="icon-x" width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
    <svg class="icon-undo" width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2.4" stroke-linecap="round"
         stroke-linejoin="round" aria-hidden="true">
      <path d="M3 3v6h6" />
      <path d="M3.5 9a9 9 0 1 0 2.2-3.4L3 8" />
    </svg>
  </span>
</button>
```

```css
.delete-action {
  position: relative; flex: none;
  width: 30px; height: 30px; border-radius: 50%;
  border: 1px solid var(--hairline);
  background: transparent;
  color: #8b8892;
  cursor: pointer;
  transition: background-color 220ms ease, border-color 220ms ease,
              color 220ms ease, transform 220ms cubic-bezier(.3,.9,.3,1);
}
/* 44px hit area — inset must be -8px: it resolves against the 28px padding box */
.delete-action::before { content: ""; position: absolute; inset: -8px; }

.delete-action:hover  { background: var(--accent); border-color: var(--accent);
                        color: var(--text); transform: scale(1.1); }
.delete-action:active { background: var(--accent-ink); border-color: var(--accent-ink);
                        color: var(--text); transform: scale(0.94); }
.delete-action:disabled { opacity: 0.45; cursor: wait; transform: none; }

.delete-icons { position: absolute; inset: 0; display: grid; place-items: center; }
.icon-x, .icon-undo {
  grid-area: 1 / 1;
  transition: opacity 280ms ease, transform 440ms cubic-bezier(.3,.9,.3,1);
}
.icon-undo { opacity: 0; transform: rotate(135deg) scale(0.55); }

/* ghost = the row is in its undo window */
.article-row.is-ghost .icon-x    { opacity: 0; transform: rotate(-135deg) scale(0.55); }
.article-row.is-ghost .icon-undo { opacity: 1; transform: none; }
```

## Ghost row (undo window)

The row keeps its place in the list. The title block is replaced by one line of muted text; the
X has already become the undo arrow, wrapped by the draining ring.

```html
<li class="article-row is-ghost" data-item-id="…">
  <p class="article-ghost">Deleted “Title”.</p>
  <button class="delete-action" type="button" aria-label="Undo delete">
    <svg class="undo-ring" viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="18" cy="18" r="16" />
    </svg>
    <span class="delete-icons">…same two icons…</span>
  </button>
</li>
```

```css
.article-ghost {
  margin: 0; flex: 1; min-width: 0;
  color: var(--text-muted); font-size: 0.875rem; font-weight: 500;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.undo-ring {
  position: absolute; inset: -1px;
  width: 30px; height: 30px;
  transform: rotate(-90deg);
  pointer-events: none;
}
.undo-ring circle {
  fill: none; stroke: var(--accent-ink); stroke-width: 3;
  stroke-dasharray: 100.6;                  /* 2πr where r = 16 */
  animation: ring-drain var(--undo-window, 7000ms) linear both;
}
```

## Bands

```css
/* Update ready — the only place a word-label button survives */
.update-message {
  display: flex; align-items: center; justify-content: space-between; gap: var(--gap);
  margin: 1.125rem var(--gutter) 0.25rem;
  padding: 0.75rem 0.75rem 0.75rem 0.875rem;
  border: 1.5px solid var(--text); border-radius: var(--r-band);
  background: var(--success-bg);
  font-size: 0.84rem; font-weight: 600; line-height: 1.35;
}
.update-message[hidden] { display: none; }   /* reserves no space */

.update-action {
  flex: none; height: var(--target); padding: 0 1rem;
  border: 0; border-radius: var(--r-pill);
  background: var(--text); color: #fff;
  font-weight: 800; font-size: 0.81rem; letter-spacing: 0.03em;
  cursor: pointer; transition: background-color 200ms ease;
}
.update-action:hover    { background: #2b2b33; }
.update-action:disabled { opacity: 0.55; cursor: wait; }

/* Status — share saved, restored */
.status-message:not(:empty) {
  display: flex; align-items: center; gap: 0.625rem;
  margin: 0.375rem var(--gutter) 1.25rem;
  padding: 0.6875rem 0.8125rem;
  border: 1px solid var(--success-line); border-radius: 8px;
  background: var(--success-bg);
  color: var(--text); font-size: 0.84rem; font-weight: 650;
}

/* Error — invalid share, storage failure, delete and restore failure */
.error-message {
  display: flex; align-items: flex-start; gap: 0.625rem;
  margin: 0.375rem var(--gutter) 1.25rem;
  padding: 0.6875rem 0.8125rem;
  border: 1px solid var(--error-line); border-radius: 8px;
  background: var(--error-bg);
  color: var(--error); font-size: 0.84rem; font-weight: 650; line-height: 1.45;
}
.error-message[hidden] { display: none; }
```

Both bands take a leading mark so meaning is never colour-only: a lime tick for status, a filled
`!` disc for error. Insert them as `::before` content or as an inline SVG the script adds
alongside the text; either is fine, but do not let it into the accessible name.

## Footnote

```css
footer {
  max-width: 23rem; margin: 1.75rem auto 1.375rem;
  padding: 0 var(--gutter);
  color: var(--text-muted);
  font-size: 0.72rem; line-height: 1.55; text-align: center;
}
```

Copy is unchanged: **Stored only in this browser. Clearing its data may remove your list.**

## Focus

```css
:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
.delete-action:focus-visible { outline-offset: 3px; }
```

Ink rather than a colour so it works on white, on lime and on the error band.

## Skip link

Keep it. Restyle only: `background: var(--text)`, `color: #fff`, `border-radius: 8px`.
