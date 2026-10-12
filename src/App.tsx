import { useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { deck, questions, type QuestionSlide as QSlide } from "./content";
import { initialState, presentationReducer } from "./state";
import { InfoSlides } from "./InfoSlides";
import { QuestionSlide, OriginalQuestion } from "./QuestionSlide";
import { Botanical } from "./Diagrams";
type Panel =
  "contents" | "help" | "timer" | "notes" | "reset" | "original" | null;
function Icon({
  name,
}: {
  name: "menu" | "fullscreen" | "clock" | "help" | "notes" | "reset" | "close";
}) {
  const paths = {
    menu: "M4 5h16M4 12h16M4 19h16",
    fullscreen: "M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5",
    clock: "M12 7v5l3 2",
    help: "M9 8a3 3 0 1 1 5 2.6c-1.3.6-2 1.4-2 3.4M12 17h.01",
    notes: "M7 3h10l3 3v15H4V3h3M8 10h8M8 14h8M8 18h5",
    reset: "M4 10a8 8 0 1 1 1 7M4 4v6h6",
    close: "M5 5l14 14M19 5L5 19",
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {(name === "clock" || name === "help") && (
        <circle cx="12" cy="12" r="9" />
      )}
      <path d={paths[name]} />
    </svg>
  );
}
function Modal({
  title,
  children,
  onClose,
  drawer = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.querySelector<HTMLElement>("button, input")?.focus();
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className={`modal ${drawer ? "drawer" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onClose();
          }
          if (e.key === "Tab") {
            const nodes = Array.from(
              ref.current!.querySelectorAll<HTMLElement>(
                'button:not(:disabled),input,a[href],select,[tabindex="0"]',
              ),
            );
            const first = nodes[0],
              last = nodes[nodes.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            className="icon-button"
            aria-label="Close panel"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
export default function App() {
  const [state, dispatch] = useReducer(presentationReducer, initialState);
  const [panel, setPanel] = useState<Panel>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState("");
  const [preset, setPreset] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const timerDeadline = useRef(0);
  const headingRef = useRef<HTMLElement>(null);
  const slide = deck[state.index];
  const q =
    slide.kind === "question"
      ? questions.find((q) => q.id === (slide as QSlide).questionId)!
      : undefined;
  const questionPosition = q ? questions.indexOf(q) + 1 : null;
  const dark = ["opening", "section", "closing"].includes(slide.kind);
  const navigate = (index: number) => {
    dispatch({ type: "navigate", index });
    setPanel(null);
    setNotice("");
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setNotice(
        "Fullscreen is unavailable here. Use your browser’s fullscreen command.",
      );
    }
  };
  useEffect(() => {
    const fn = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", fn);
    return () => document.removeEventListener("fullscreenchange", fn);
  }, []);
  useEffect(() => {
    headingRef.current?.focus();
  }, [state.index]);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const next = Math.max(
        0,
        Math.ceil((timerDeadline.current - Date.now()) / 1000),
      );
      setRemaining(next);
      if (next === 0) setRunning(false);
    }, 200);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.repeat || panel) return;
      const target = e.target as HTMLElement;
      if (
        target.isContentEditable ||
        target.closest(
          'input,textarea,select,[contenteditable="true"],[role="textbox"]',
        )
      )
        return;
      if (
        (e.key === " " || e.key === "Enter") &&
        target.closest('button,a,[role="button"]')
      )
        return;
      switch (e.key.toLowerCase()) {
        case "arrowright":
          e.preventDefault();
          navigate(state.index + 1);
          break;
        case "arrowleft":
          e.preventDefault();
          navigate(state.index - 1);
          break;
        case " ":
          e.preventDefault();
          if (q && state.stage === "question") dispatch({ type: "reveal" });
          else if (q && state.stage === "answer") dispatch({ type: "explain" });
          else if (q && state.step < q.steps.length)
            dispatch({ type: "step", step: state.step + 1 });
          else navigate(state.index + 1);
          break;
        case "a":
          if (q) {
            e.preventDefault();
            dispatch({ type: "reveal" });
          }
          break;
        case "e":
          if (q) {
            e.preventDefault();
            dispatch({ type: "explain" });
          }
          break;
        case "h":
          if (q) {
            e.preventDefault();
            dispatch({ type: "hide" });
          }
          break;
        case "f":
          e.preventDefault();
          void toggleFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [state, q, panel]);
  const timerText = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
  return (
    <div className={`presentation ${dark ? "dark" : ""}`}>
      <header className="topbar">
        <button
          className="brand"
          onClick={() => navigate(0)}
          aria-label="Go to opening slide"
        >
          <span className="brand-symbol">⌁</span>
          <b>CS4023</b>
          <span className="brand-divider" />
          <span className="brand-label">MIDTERM PREPARATION</span>
        </button>
        <div className="toolbar">
          <button
            onClick={() => setPanel("contents")}
            aria-label="Open contents"
          >
            <Icon name="menu" />
            <span>Contents</span>
          </button>
          <button
            onClick={() => setPanel("timer")}
            aria-label="Open discussion timer"
          >
            <Icon name="clock" />
            <span>{running || remaining === 0 ? timerText : "Timer"}</span>
            {remaining === 0 && <span className="timer-ended">Done</span>}
          </button>
          <button
            onClick={() => setPanel("notes")}
            aria-label="Open presenter notes"
            title="Notes appear on the projected screen"
          >
            <Icon name="notes" />
            <span>Notes</span>
          </button>
          <button
            onClick={() => setPanel("help")}
            aria-label="Keyboard shortcut help"
          >
            <Icon name="help" />
          </button>
          <button
            onClick={() => void toggleFullscreen()}
            aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={
              fullscreen ? "Exit fullscreen (F or Escape)" : "Fullscreen (F)"
            }
          >
            <Icon name="fullscreen" />
            <span>{fullscreen ? "Exit" : "Fullscreen"}</span>
          </button>
        </div>
      </header>
      <main
        ref={headingRef}
        tabIndex={-1}
        className="slide"
        id={slide.id}
        aria-label={`Slide ${state.index + 1}: ${slide.title}`}
      >
        {!dark && (
          <div className="edge-art">
            <Botanical />
          </div>
        )}
        <div className="slide-inner" key={slide.id}>
          {q ? (
            <QuestionSlide
              q={q}
              state={state}
              dispatch={dispatch}
              onOriginal={() => setPanel("original")}
            />
          ) : (
            <InfoSlides
              slide={slide as Exclude<typeof slide, QSlide>}
              onNext={() => navigate(state.index + 1)}
            />
          )}
        </div>
      </main>
      {notice && (
        <div className="notice" role="status">
          {notice}
          <button onClick={() => setNotice("")}>Dismiss</button>
        </div>
      )}
      <footer className="bottom-bar">
        <div className="position">
          <span className="slide-counter">
            {String(state.index + 1).padStart(2, "0")}
            <span> / {deck.length}</span>
          </span>
          <div>
            <strong>
              {q
                ? `Sample question ${questionPosition} of 11`
                : slide.kind === "section"
                  ? "Question style " + slide.section
                  : slide.kind === "opening"
                    ? "Welcome"
                    : slide.title}
            </strong>
            <span>
              {q
                ? `Example ${q.id} · ${q.title}`
                : "CS4023 · University of Limerick"}
            </span>
          </div>
        </div>
        <div className="footer-hint">
          <kbd>SPACE</kbd>{" "}
          {q
            ? state.stage === "question"
              ? "reveal answer"
              : state.stage === "answer"
                ? "explain why"
                : state.step < q.steps.length
                  ? "next explanation"
                  : "next slide"
            : "next slide"}
        </div>
        <nav aria-label="Slide navigation">
          <button
            className="nav-button"
            disabled={state.index === 0}
            onClick={() => navigate(state.index - 1)}
            aria-label="Previous slide"
          >
            ←
          </button>
          <button
            className="nav-button next"
            disabled={state.index === deck.length - 1}
            onClick={() => navigate(state.index + 1)}
            aria-label="Next slide"
          >
            Next <span>→</span>
          </button>
        </nav>
        <div
          className="deck-progress"
          style={{ width: `${((state.index + 1) / deck.length) * 100}%` }}
        />
      </footer>
      {panel && (
        <Modal
          key={panel}
          title={
            {
              contents: "Session contents",
              help: "Presentation shortcuts",
              timer: "Discussion timer",
              notes: "Presenter notes",
              reset: "Reset this session?",
              original: "Original sample question",
            }[panel]
          }
          drawer={panel === "contents"}
          onClose={() => setPanel(null)}
        >
          {panel === "contents" && (
            <>
              <p className="panel-intro">
                Jump to any slide. Questions always open with the answer hidden.
              </p>
              <nav className="contents-list" aria-label="Contents">
                {deck.map((s, i) => (
                  <button
                    key={s.id}
                    className={`${state.index === i ? "active" : ""} ${s.kind === "question" ? "contents-question" : ""}`}
                    aria-current={state.index === i ? "step" : undefined}
                    onClick={() => navigate(i)}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <strong>{s.title}</strong>
                    {s.kind === "section" && <small>SECTION</small>}
                  </button>
                ))}
              </nav>
              <button className="reset-link" onClick={() => setPanel("reset")}>
                <Icon name="reset" /> Reset session…
              </button>
            </>
          )}
          {panel === "help" && (
            <>
              <p className="panel-intro">
                Use the keyboard when focus is on the presentation. Buttons
                retain their normal Space behaviour.
              </p>
              <dl className="shortcut-list">
                {[
                  ["→ / ←", "Next / previous slide"],
                  [
                    "Space",
                    "Reveal → explain → next explanation step → advance",
                  ],
                  ["A", "Reveal answer"],
                  ["E", "Explain, after revealing the answer"],
                  ["H", "Hide answer and all explanation content"],
                  ["F", "Toggle fullscreen"],
                  ["Escape", "Close a panel or exit fullscreen"],
                ].map(([key, desc]) => (
                  <div key={key}>
                    <dt>
                      <kbd>{key}</kbd>
                    </dt>
                    <dd>{desc}</dd>
                  </div>
                ))}
              </dl>
              <p>
                Shortcuts are paused in panels and editable fields. Slide arrows
                move to a different slide; explanation buttons move through
                reasoning steps.
              </p>
            </>
          )}
          {panel === "timer" && (
            <>
              <p className="panel-intro">
                A manual discussion aid. It never reveals answers or moves the
                deck, and makes no sound.
              </p>
              <div
                className={`timer-display ${remaining === 0 ? "expired" : ""}`}
                role="timer"
                aria-label={`${remaining} seconds remaining`}
              >
                {timerText}
              </div>
              {remaining === 0 && (
                <p role="status" className="timer-message">
                  Time’s up. Continue the discussion whenever you’re ready.
                </p>
              )}
              <div className="timer-presets">
                {[30, 60, 90].map((t) => (
                  <button
                    key={t}
                    aria-pressed={preset === t}
                    className={preset === t ? "active" : ""}
                    onClick={() => {
                      setPreset(t);
                      setRemaining(t);
                      setRunning(false);
                    }}
                  >
                    {t} sec
                  </button>
                ))}
              </div>
              <label className="custom-timer">
                Custom duration (seconds)
                <input
                  type="number"
                  min="1"
                  max="3600"
                  value={preset}
                  onChange={(e) => {
                    const t = Math.min(
                      3600,
                      Math.max(1, Number(e.target.value) || 1),
                    );
                    setPreset(t);
                    setRemaining(t);
                    setRunning(false);
                  }}
                />
              </label>
              <div className="timer-actions">
                <button
                  className="primary"
                  disabled={remaining === 0}
                  onClick={() => {
                    if (running) setRunning(false);
                    else {
                      timerDeadline.current = Date.now() + remaining * 1000;
                      setRunning(true);
                    }
                  }}
                >
                  {running ? "Pause" : "Start"}
                </button>
                <button
                  className="secondary"
                  onClick={() => {
                    setRemaining(preset);
                    setRunning(false);
                  }}
                >
                  Reset timer
                </button>
              </div>
              <p className="small-note">
                The timer continues when this panel closes. The toolbar shows
                the remaining time.
              </p>
            </>
          )}
          {panel === "notes" && (
            <>
              <div className="notes-warning">
                Visible on the projector. These notes are in the same window as
                the students’ slides.
              </div>
              <h3>{slide.title}</h3>
              <p>
                {q
                  ? q.notes
                  : slide.kind === "exam"
                    ? "The sample document specifies the format shown. This deck is a preparation session using 11 illustrative examples, not an official 30-question paper."
                    : slide.kind === "technique"
                      ? "Expected score = (4p−1)/3. The threshold is p > 1/4. Uniform guessing has expectation 0 for four options, 1/9 for three, and 1/3 for two. The source’s advice is conservative, not a mathematical requirement to eliminate two."
                      : slide.kind === "coverage"
                        ? "Coverage does not imply a supplied example exists for every topic. W6 mentions calculation-style questions, but none is supplied. Do not invent official scheduling questions."
                        : "Invite students to explain their reasoning. Selecting an option is optional; reveal only after discussion."}
              </p>
              <p className="small-note">
                Full source clarifications and primary references are in
                docs/PRESENTER_CLARIFICATIONS.md.
              </p>
            </>
          )}
          {panel === "reset" && (
            <>
              <p>
                Return to the opening slide, clear the room’s selection, hide
                all answers, and reset the discussion timer to 60 seconds.
              </p>
              <div className="timer-actions">
                <button className="secondary" onClick={() => setPanel(null)}>
                  Keep presenting
                </button>
                <button
                  className="primary"
                  onClick={() => {
                    dispatch({ type: "reset" });
                    setPreset(60);
                    setRemaining(60);
                    setRunning(false);
                    setPanel(null);
                  }}
                >
                  Reset session
                </button>
              </div>
            </>
          )}
          {panel === "original" && q && (
            <OriginalQuestion q={q} state={state} dispatch={dispatch} />
          )}
        </Modal>
      )}
    </div>
  );
}
