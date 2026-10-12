import { letters, type Question } from "./content";
import { CodeBlock } from "./CodeBlock";
import { Diagram } from "./Diagrams";
import type { Action, PresentationState } from "./state";
export function AnswerOptions({
  q,
  state,
  dispatch,
  original = false,
}: {
  q: Question;
  state: PresentationState;
  dispatch: (a: Action) => void;
  original?: boolean;
}) {
  const revealed = state.stage === "answer" && !original;
  return (
    <div
      className={`answer-options ${q.code ? "with-code-options" : ""}`}
      role="group"
      aria-label="Answer choices"
    >
      {q.options.map((option, i) => {
        const correct = revealed && letters[i] === q.answer;
        const selected = !original && state.selected === i;
        return (
          <button
            key={i}
            type="button"
            className={`option ${selected ? "selected" : ""} ${correct ? "correct" : ""} ${revealed && selected && !correct ? "reconsider" : ""}`}
            disabled={original || state.stage !== "question"}
            aria-pressed={selected}
            onClick={() => dispatch({ type: "select", option: i })}
          >
            <span className="option-letter">{letters[i]}</span>
            <span className="option-text">{option}</span>
            {correct ? (
              <span className="option-status">✓ Correct</span>
            ) : selected ? (
              <span className="option-status">
                {revealed ? "Room’s choice" : "Selected"}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
export function OriginalQuestion({
  q,
  state,
  dispatch,
}: {
  q: Question;
  state: PresentationState;
  dispatch: (a: Action) => void;
}) {
  return (
    <>
      <h2>Example {q.id} · Original question</h2>
      <p>{q.prompt}</p>
      {q.code && <CodeBlock code={q.code} />}{" "}
      {q.afterCode && <p>{q.afterCode}</p>}
      <AnswerOptions q={q} state={state} dispatch={dispatch} original />
    </>
  );
}
export function QuestionSlide({
  q,
  state,
  dispatch,
  onOriginal,
}: {
  q: Question;
  state: PresentationState;
  dispatch: (a: Action) => void;
  onOriginal: () => void;
}) {
  const explanation = state.stage === "explanation";
  const optionIndex = letters.indexOf(q.answer);
  const steps = q.steps.length + 1;
  if (explanation) {
    const isDistractors = state.step === q.steps.length;
    const step = q.steps[state.step];
    return (
      <div className="question-content explanation-content">
        <div className="question-heading">
          <div className="eyebrow">
            EXAMPLE {q.id} <span>· {q.title}</span>
          </div>
          <div className="stage-tag">
            Explanation{" "}
            <span>
              {state.step + 1} / {steps}
            </span>
          </div>
        </div>
        <div className="original-strip">
          <span>{q.afterCode || q.prompt}</span>
          <button onClick={onOriginal}>
            View original question{q.code ? " & code" : ""} ↗
          </button>
        </div>
        <div className="explanation-body">
          <h1>
            {isDistractors ? "Why the other options don’t fit." : step.title}
          </h1>
          {isDistractors ? (
            <>
              <div className="misconceptions">
                {letters
                  .filter((l) => l !== q.answer)
                  .map((l) => (
                    <article key={l}>
                      <span className="misconception-letter">{l}</span>
                      <div>
                        <h3>{q.options[letters.indexOf(l)]}</h3>
                        <p>{q.misconceptions[l]}</p>
                      </div>
                    </article>
                  ))}
              </div>
              <div className="takeaway">
                <span>TAKEAWAY</span>
                {q.steps[q.steps.length - 1].takeaway}
              </div>
            </>
          ) : (
            <>
              <div className={`explain-layout ${step.code ? "has-fix" : ""}`}>
                <div className="explain-prose">
                  {step.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                {step.diagram && <Diagram kind={step.diagram} />}{" "}
                {step.code && (
                  <CodeBlock
                    code={step.code}
                    label="C · optional mutex fix (excerpt)"
                  />
                )}
              </div>
              <div className="takeaway">
                <span>TAKEAWAY</span>
                {step.takeaway}
              </div>
            </>
          )}
        </div>
        <div className="stage-actions">
          <button
            className="secondary"
            onClick={() => dispatch({ type: "hide" })}
          >
            ← Back to question
          </button>
          <div className="explanation-pagination">
            <button
              className="secondary"
              disabled={state.step === 0}
              onClick={() => dispatch({ type: "step", step: state.step - 1 })}
            >
              ← Previous step
            </button>
            <span>
              {state.step + 1} / {steps}
            </span>
            <button
              className="primary"
              disabled={state.step === steps - 1}
              onClick={() => dispatch({ type: "step", step: state.step + 1 })}
            >
              Next explanation →
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`question-content ${q.code ? "code-question" : ""}`}>
      <div className="question-heading">
        <div className="eyebrow">
          EXAMPLE {q.id} <span>· {q.title}</span>
        </div>
        <div className="stage-tag">
          {state.stage === "question" ? "Question" : "Answer"}
        </div>
      </div>
      <h1 className="question-prompt">{q.prompt}</h1>
      <div className={`question-layout ${q.code ? "has-code" : ""}`}>
        {q.code && <CodeBlock code={q.code} />}
        <div className="choices-column">
          {q.afterCode && <h2 className="after-code">{q.afterCode}</h2>}
          <AnswerOptions q={q} state={state} dispatch={dispatch} />
          {state.stage === "answer" && (
            <div
              className="answer-summary"
              data-testid="answer-summary"
              aria-live="polite"
            >
              <span className="answer-summary-label">
                {q.id === "3.2" ? "SUPPLIED EXPECTED ANSWER" : "CORRECT ANSWER"}{" "}
                · {q.answer}
              </span>
              <strong className="sr-only">{q.options[optionIndex]}</strong>
              <p>{q.reason}</p>
              {state.selected !== null && (
                <small>
                  {state.selected === optionIndex
                    ? "The room’s choice matches."
                    : `The room selected ${letters[state.selected]}. Let’s compare the reasoning.`}
                </small>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="stage-actions">
        {state.stage === "question" ? (
          <>
            <span className="discussion-hint">
              {state.selected === null
                ? "Discuss first. Choosing an option is optional."
                : `Room’s choice: ${letters[state.selected]}. Ready to compare?`}
            </span>
            <button
              className="primary"
              onClick={() => dispatch({ type: "reveal" })}
            >
              Reveal answer <kbd>A</kbd>
            </button>
          </>
        ) : (
          <>
            <button
              className="secondary"
              onClick={() => dispatch({ type: "hide" })}
            >
              Hide answer <kbd>H</kbd>
            </button>
            <button
              className="primary"
              onClick={() => dispatch({ type: "explain" })}
            >
              Explain why <kbd>E</kbd>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
