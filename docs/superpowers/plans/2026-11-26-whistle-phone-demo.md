# Whistle Phone Demo Implementation Plan

**Goal:** Present the original Whistle landing page and media, with Play opening an entirely local mobile practice demo in a generic phone.

**Architecture:** A dedicated Whistle component isolates the original landing page in an iframe, then loads the existing app in a phone frame. Local fixtures and immutable practice state replace Firebase, live feeds and push providers. Other portfolio demos and concurrent user edits stay intact.

**Tech stack:** Existing Astro, strict TypeScript and CSS; no dependencies added.

## Accepted requirements

- Use the exact original landing page layout, copy, fonts, join image, promo video and Play/Win videos. Add Play demo actions; historical store/support links open outside the iframe. Pause its media when entering the app, and respect reduced motion.
- Play replaces the landing with a generic phone. Back to landing ends that session; Play starts fresh.
- Fixed three-day schedule with basketball and football games. An icon-only row sits above the dates: basketball/football enabled, soccer/baseball disabled, all with accessible names.
- Join goes directly to the game screen. The question list starts empty. Trigger the first question after 2,000 ms and the next after 5,000 ms from an answer or timeout. Display only triggered questions.
- Adapt the original practice question bank locally. Basketball uses the existing NBA replay questions; football uses the six original practice prompts. Preserve weighted scoring, settings and leaderboard.
- Match `targets/notification-content/NotificationViewController.swift`: a bottom notification sheet with a centered 72px radial countdown, 30-second window, centered 18px question, blue point label, and two-column blue 52px answer buttons with 10px corners. Expire unanswered questions and prevent late answers. Preserve both themes, keyboard operation and reduced motion.
- Work locally on the existing main branch, preserving concurrent CreatorKitchen/transformer work. No commit, push or deployment requested.

## Tasks

- [x] Add failing domain tests, then implement triggered question selection, sport isolation, once-only scoring, deadline enforcement and expiration.
- [x] Restore the original landing source/media and add validated Play messaging, media pausing, return and iframe theme synchronization.
- [x] Add phone frame, sport icons/schedules, direct joining, timed practice progression and native-style countdown notification.
- [x] Verify final browser flow at narrow/wide sizes and both themes: media, timing, notification answers, timeout, leave/rejoin, restart, keyboard and overflow.
- [x] Run full Prettier, lint, Astro check, tests and production build; complete focused independent review.

## Review focus

- Answers award points once, reject expired/unrevealed questions, and never cross games or sports.
- Dismiss, leave, switch, restart and timeout do not strand or leak the question progression.
- Phone and notifications fit a 320px outer viewport; count remains legible in both themes.
- Keyboard focus survives answer sheets and notification dismissal; automatic updates do not replace focused choices.
- Original media loads and pauses on Play. Local practice makes no backend/provider/notification-permission calls.
- Shared demo code and concurrent user changes are preserved.

## Verification so far

- Browser: original three videos loaded (readyState 4), no media errors; first question observed at 2,086 ms and second at 5,099 ms after answering. Football direct entry, sequential question list and score update observed.
- Domain: seven tests pass, including deterministic 30-second boundary and late-answer rejection.
- Initial build passed with existing CreatorKitchen duplicate-case and InstaMosaic stylesheet warnings; final checks will be rerun after the notification/icon changes.

## Final verification

- Original landing source/layout retained; all five local media files match the original bytes. All six landing images (including repeated store badges) loaded. Three videos loaded without errors and were observed paused after returning from the phone. A new Play resets sport, date and session state.
- Browser checks covered wide layout and 320px light/dark layouts. At 320px, outer document width/scroll width were 320/320, phone app 266/266 and landing iframe 297/297. Disabled sport icons, sport/day filtering and direct entry were observed.
- Countdown ticked from 30, expired the unanswered question, kept score at zero and automatically delivered the next question. Incorrect and correct answers, all three-choice buttons, native dialog Escape/focus restoration, complete 35-point round, first-place leaderboard, Play again and clean leave were observed. Restart had zero questions and score zero.
- Independent review found three issues, all fixed: preserve external Google Play badge URLs; render current state when returning from leaderboard/settings; cancel an old result auto-hide timer before replacing a notification. Browser reproduction showed zero questions after leaderboard return before the fix and one after; rapid reentry then retained the next notification beyond the old dismissal time. No browser error logs were observed.
- Final full checks: Prettier and lint exit 0; Astro has zero diagnostics across 77 files; all 27 tests pass; production build completes with 45 pages. Existing CreatorKitchen duplicate-case and InstaMosaic last-child stylesheet warnings remain. `git diff --check` passes.
- Work remains local. No commit, push or deployment performed. Preview: http://127.0.0.1:4323/work/whistle/.

## Follow-up refinement — phone, schedule and notification entry

User requested a taller iPhone 17 style frame, established icons, dollars for game values, player icons/counts below values, no header balance, a full seven-day schedule with six games per sport/day, tighter spacing, top banners that expand on tap, no question point labels, no correct/incorrect popups, and no redundant top-right leave button.

- Phone follows Apple's published 71.5:149.6 width/height ratio. Width is capped at 350px; status chrome, Dynamic Island shape and iframe fill the frame without viewport-dependent stretching.
- Use archived Ionicons v7.4.0 for sports, settings, players, navigation and leaderboard. Keep their license with the public assets.
- Generate a deterministic 14–20 November fixture week, six distinct pairings per sport/day. Each sport has twelve original team logos. A new domain test verifies the schedule invariant.
- Keep score/leaderboard logic; game pool values display as dollars. Remove balance, question point labels and result notifications.
- Preserve question arrival timing and 30-second deadline. Arrival shows a collapsed top banner; activating it or a pending question opens the countdown/choices in the same top notification. Dismiss/Escape restores focus. Answers resolve inline without another popup.
- Back remains the sole return control; current practice progress is preserved when returning to the schedule.
- [x] Schedule regression test failed on the incomplete week, then passed with all 84 fixtures.
- [x] Implement frame, icons, values, compact layout and two-stage notifications.
- [x] Verify final collapsed/expanded behavior, correct/incorrect answers, expiration, schedules, dimensions, mobile overflow, both themes and keyboard.
- [x] Run final required checks and focused independent review.

Additional user request: make App Store/Google Play badges and footer Privacy/Testers/Support links inert, preserving their visual appearance. Remove their href/target attributes and expose their disabled state accessibly; Play demo remains active.

Further user requirements: remove practice branding and completion; keep questions arriving continuously during a game. Repeat the sport question bank with fresh instance IDs, keep cumulative score and only the last twenty question records. Preserve the native Settings account/winnings/preferences/actions grouping; show a preset $0.00 winnings balance and original disabled minimum-$10 withdrawal control. Appearance cycles Light/Dark/Auto as in the app, changing both app and phone chrome, with parent/source-validated theme messages. Retain inactive account/service actions as disabled. Hide demo scrollbars and pin games header/sports/dates; only the game list scrolls. Settings content also scrolls beneath its header.

## Follow-up verification

- Full final checks pass: Prettier, ESLint, Astro (zero diagnostics across 81 files), all 29 tests, and production build (45 pages). Existing CreatorKitchen duplicate-case and InstaMosaic stylesheet warnings remain. A transient concurrent CreatorKitchen formatting/import failure was observed earlier; final whole-repository reruns passed without editing those files.
- Phone measured 350 × 732.3px on desktop and 288 × 602.6px at 320px outer width. Outer width/scroll width 320/320 and app 270/270; notification settles at top 8px. Original team artwork and Ionicons render in both themes.
- Browser confirmed seven date controls and six games for the selected sport/day, including Friday football. Dollar values and people counts replace the old point-prize symbols; header balance, leave control and question point labels are absent.
- First banner observed after 2,039ms with hidden countdown; a real click expanded the countdown/choices. No correct/incorrect popup appeared. Leaving/reentering after answering preserved a 5,069ms subsequent arrival. A fourth question arrived as a fresh instance after the original three.
- Opened a repeated question from its list row and allowed it to expire. Focus remained on the surviving game heading, the notification closed, and expiry stayed in the answer list. Domain tests cover 60 consecutive answers with cumulative score and a twenty-record history; independent review also exercised repeated answers/timeouts.
- Settings retains Account, Winnings, Preferences, Actions and Danger Zone. Funds are the $0.00 fixture with the native minimum-withdrawal disabled control. Light/Dark/Auto changes the app and chrome; Auto initializes from the actual system appearance, independently of the portfolio theme. Dark and Auto were observed synchronized after message delivery.
- Scrollbars are hidden inside the app and landing. Keyboard PageDown moved only the game list (scrollTop 113) while header/sports/dates stayed at 0/56/104px and document scroll remained zero. Focusing the final matchup also scrolled the list to 371.5px without moving these controls. Settings content scrolled beneath a fixed header.
- Both store badges and all three footer destinations are disabled with no href. The original media and active Play controls remain intact. Browser error logs were empty; temporary viewport overrides were reset and QA tabs closed.
- Focused reviews found and verified fixes for expiry focus restoration, preserved reentry deadlines, and accurate Auto appearance. Work remains local on main, with unrelated concurrent edits preserved. No commit, push or deployment performed.

Latest copy/timing edits: add a muted Tap to answer hint to collapsed banners, remove both waiting messages and the Questions header, and reduce the next-question delay from five seconds to three after answers or timeouts. Preserve the two-second first arrival and thirty-second answer window.

Latest timing adjustment: first question now arrives after 1,000ms; the three-second subsequent gap and thirty-second answer window are unchanged.

Latest timing requirement: send each subsequent question one second after the previous question resolves or expires. Start this delay on resolution, rather than answer submission, and preserve it across leaving/reentering while resolution is pending. Initial arrival remains one second.
