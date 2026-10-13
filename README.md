# CS4023 Midterm Preparation

![OS Midterm Preparation Presentation Intro Page](<img width="901" height="510" alt="Screenshot 2026-10-13 at 10 22 51" src="https://github.com/user-attachments/assets/181f5965-395f-46b3-9a55-eb78065e3793" />)

A local React + TypeScript + Vite presentation for second-year University of Limerick students, led by Adam, James & Bart. Includes 23 slides, all 11 sample questions in source order, separate answer and explanation stages, 23 explanation pages, conceptual diagrams, week coverage, preparation advice, and exam technique.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the printed local URL (normally http://127.0.0.1:5173). Dependencies are needed only for setup/build. The running presentation uses bundled code and SVG, system fonts, no accounts, backend, runtime AI, or third-party network requests.

```sh
npm run typecheck
npm run build
npm run preview
npm test
```

The static production output is in `dist/`. Serve it using `npm run preview` or a local static HTTP server; opening `index.html` directly with `file://` is not supported. Browser tests use installed Google Chrome by default; change `channel` in `playwright.config.ts` to use a locally installed Playwright browser.

## Present

Start with the opening slide. Select a room answer if useful; selection never marks correctness. **Reveal answer** gives the correct option and a short reason. **Explain why** opens the worked model, then a separate page discussing every distractor. Example 3.2 includes an additional data-race/mutex page. Original questions and code stay available through **View original question & code**. The answer and all teaching visuals disappear when hidden. Moving to any other slide resets the reveal state and room selection, including on return.

| Key          | Action                                                |
| ------------ | ----------------------------------------------------- |
| Right / Left | Next / previous slide                                 |
| Space        | Reveal → explain → next explanation page → next slide |
| A            | Reveal answer                                         |
| E            | Explain after answer is revealed                      |
| H            | Return to question-only view                          |
| F            | Toggle fullscreen                                     |
| Escape       | Close panels / browser fullscreen exit                |

Buttons keep normal keyboard behaviour (Space activates a focused button). Presentation shortcuts do not fire in editable fields or open panels. Click the slide background to return focus to the deck. Contents jumps directly to sections/questions. Fullscreen can also be exited with the visible **Exit** button. Reset session is in Contents and requires a second explicit action.

The optional timer offers 30/60/90 seconds and a custom duration. Start, pause, and reset it manually. Expiry shows “Done”; it never reveals, advances, or plays sound. It continues if the panel closes. Notes are hidden by default and **are visible to students when opened on the projected window**. They are not a private presenter view.

## Edit

- `src/content.ts`: typed question data, original options/code, answer key, explanations, misconceptions, notes, coverage, section introductions, slide order. Keep IDs stable.
- `src/InfoSlides.tsx`: opening, exam information, tips and closing content/layout.
- `src/QuestionSlide.tsx`: reusable options and question/answer/explanation views.
- `src/Diagrams.tsx`: conceptual teaching diagrams and botanical SVG.
- `src/state.ts`: explicit reveal-state reducer; navigation always resets.
- `src/App.tsx`: navigation, drawer, fullscreen, shortcuts, timer, focus handling.
- `src/CodeBlock.tsx`: local C syntax highlighting.
- `src/styles.css`: palette, projector layouts, responsive and reduced-motion rules.

Read [presenter source clarifications](docs/PRESENTER_CLARIFICATIONS.md) before the session. The source DOCX and visual reference remain unchanged in the project root. No official exam questions, scheduling calculation questions, or missing course resource URLs have been invented.

## Verification

See [verification report](docs/VERIFICATION.md) for the completed checks and remaining limitations.
