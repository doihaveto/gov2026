# מרכיבים ממשלה – Israeli election coalition game (2026)

A static HTML/JS game in Hebrew and English (toggle in the header; the choice is remembered). There's no build step, no server and no external requests. Open `index.html` in a browser.

## Files
| File | Contents |
|---|---|
| `index.html` | Page shell (RTL, Hebrew) |
| `style.css` | Styles, including light and dark mode and mobile layout |
| `data.js` | **All editable data**: parties and candidate lists, polls, ministries and tiers, red lines between parties, sources |
| `i18n.js` | English version: interface strings (keyed by the Hebrew text) and English overlays for all data (parties, candidate names, ministries, polls, notices, source descriptions). Sources themselves stay the original (mostly Hebrew) articles |
| `game.js` | Model (demands, realism scoring), UI, share codes, share image |

## Game flow
1. **Poll.** Pick one of the 9 latest polls (17.9–5.10.2026) or one of two averages: all polls, or all polls except Channel 14 and i24NEWS (outlets listed in `ADJUSTED_AVERAGE_EXCLUDE`). In both averages a party is included if it passes the threshold in most of the averaged polls, and it gets at least 4 seats. Seats can be edited by hand.
2. **Coalition.** Each party is set to opposition, coalition member or outside support. The target is 61 seats, but you can continue without a majority: the score is then capped (55 when one seat short, 15 points lower for each further missing seat), since such a government depends on opposition abstentions. The PM is the leader of the largest coalition party unless you pick another one. Red lines and tensions are based on public statements.
3. **Government.** Assign 36 posts to specific people from the party lists. The side panel shows each party's demands and a live realism score.
4. **Summary and sharing.** You can copy a link or a text summary, share through WhatsApp, Telegram or X, use the native share sheet, download a PNG, or copy a share code.

## Model
- **Tiers:** top (Defense, Finance, Foreign, Justice + PM / alternate PM) = 4 points. Mid (9 ministries + Knesset Speaker + Finance Committee chair) = 2, except the upper-mid ministries (National Security, Interior, Education, Health; `upper: true` in `POSITIONS`) = 3. Low (19 ministries) = 1. Demands are split per tier (top / mid / low); the upper-mid weight only affects the value comparison and list order.
- **Demands:** each tier is split separately among coalition members using d'Hondt by seats. The PM counts as the PM party's first top-tier slot. If the PM isn't from the largest coalition party, that party gets the alternate PM post (rotation). On each turn, a party takes its most-preferred free post (`prefs` in `data.js`).
- **Internal order:** a party's #1 gets its first pick, #2 the second, and so on. Skips and inversions cost points.
- **Score:** 40% coalition and 60% allocation, with caps. The score can't exceed 50 if coalition members have ruled each other out, or 45 if a pivotal party wouldn't sign.

## Sharing
State is encoded in the URL hash (`#g=…`), so a link works wherever the files are hosted. When the game is opened as a local file, the link only works on this machine. In that case, share the image, the text summary or the share code, which can be pasted into the box at the bottom of step 1.

## Updating data
- Any new Hebrew text in `game.js` must be wrapped in `T('…')` and given an English entry in `I18N_EN.ui` (`i18n.js`); new data text (relations, notices, sources, list names) needs an entry in the matching `I18N_EN` section. Missing translations fall back to Hebrew and log a console warning.
- New poll: add an entry to `POLLS` in `data.js`. Seats must sum to 120, and a console warning flags polls that don't. The average updates automatically.
- List changes: edit `list` on the party (the order matters).
- New red line or tension: add to `RELATIONS` (`level` 2 = red line, 1 = tension; `sup` = level when one side is only outside support).
- Sources: every notice links to its sources. Add a source to `SRC` in `data.js` (Hebrew preferred) and reference its key from the rule's `src` array. General notices take theirs from `NOTICE_SRC`. A `method:<section>` key links to the in-game explanation instead.
- Personal limits: `PERSON_LIMITS` marks list members who can hold only the PM post (`onlyPM`, Netanyahu) or no ministry (`noMinister`, Deri). Assigning them otherwise caps the score at 35, and auto-fill skips them.
- Holdout: a party with `holdout: { minValue }` (currently Otzma Yehudit) that is pivotal for the majority demands an extra mid-tier post instead of a low one, won't sign below `minValue`, and the partners won't accept more than 3 points above its demand.
- Leader-based rules: `ANTI_BIBI` lists parties that refuse a Netanyahu-led government. `BIBI_ONLY` lists parties that will join *only* a Netanyahu-led government (currently Amcha Yisrael).

Sources are listed in the in-game "איך זה עובד?" dialog. Data is as of early October 2026.
