import { coverage, sections, type InfoSlide } from "./content";
import { Botanical } from "./Diagrams";
export function InfoSlides({
  slide,
  onNext,
}: {
  slide: InfoSlide;
  onNext: () => void;
}) {
  if (slide.kind === "opening")
    return (
      <div className="opening">
        <div className="opening-copy">
          <div className="eyebrow mint">
            <span className="tiny-leaf">⌁</span> UNIVERSITY OF LIMERICK · SECOND
            YEAR
          </div>
          <h1>
            CS4023
            <br />
            Midterm
            <br />
            <em>Preparation</em>
          </h1>
          <p className="opening-subtitle">
            Think it through. Discuss it.
            <br />
            Understand why.
          </p>
          <div className="presenters">
            <span>YOUR SESSION LEADS</span>
            <strong>Adam, James & Bart</strong>
          </div>
          <button className="primary light" onClick={onNext}>
            Let’s get started <span>→</span>
          </button>
          <p className="opening-meta">
            Operating Systems <span>•</span> Weeks 1–7 <span>•</span> 11 sample
            questions
          </p>
        </div>
        <Botanical hero />
        <span className="art-caption">
          A little curiosity. A lot of understanding.
        </span>
      </div>
    );
  if (slide.kind === "section") {
    const s = sections[slide.section! - 1];
    return (
      <div className="section-slide">
        <Botanical hero />
        <div className="section-copy">
          <div className="eyebrow mint">
            QUESTION STYLE {String(slide.section).padStart(2, "0")} / 04
          </div>
          <h1>{s.title}</h1>
          <p>{s.description}</p>
          <div className="section-cue">{s.cue}</div>
          <span className="section-range">{s.range}</span>
        </div>
      </div>
    );
  }
  if (slide.kind === "how")
    return (
      <div className="info-content">
        <div className="eyebrow">THE SESSION</div>
        <h1>Think first. Then reveal.</h1>
        <p className="lead">
          The answer matters. The reasoning is what stays with you.
        </p>
        <div className="teaching-steps">
          <article>
            <span className="step-number">01</span>
            <h2>Question</h2>
            <p>
              Read the code and all four options. Talk it through with the room.
            </p>
            <small>Selecting an option records the room’s choice only.</small>
          </article>
          <article>
            <span className="step-number">02</span>
            <h2>Answer</h2>
            <p>Reveal the correct choice and one short reason.</p>
            <small>The full explanation stays hidden.</small>
          </article>
          <article>
            <span className="step-number">03</span>
            <h2>Explanation</h2>
            <p>
              Trace what happens, unpack the distractors, and find the takeaway.
            </p>
            <small>We move on when the room is ready.</small>
          </article>
        </div>
        <div className="quiet-callout">
          No need to click an option. A verbal discussion works just as well.
        </div>
      </div>
    );
  if (slide.kind === "exam")
    return (
      <div className="info-content">
        <div className="eyebrow">FROM THE SAMPLE QUESTION DOCUMENT</div>
        <h1>Know the exam format.</h1>
        <div className="exam-metrics">
          <div>
            <strong>45</strong>
            <span>minutes</span>
          </div>
          <div>
            <strong>30</strong>
            <span>MCQs · one correct each</span>
          </div>
          <div>
            <strong>1–7</strong>
            <span>weeks covered</span>
          </div>
        </div>
        <div className="exam-bottom">
          <div>
            <h2>Every answer has a weight.</h2>
            <div className="marking">
              <span>
                <b>+1</b> correct
              </span>
              <span>
                <b>−⅓</b> incorrect
              </span>
              <span>
                <b>0</b> unanswered
              </span>
            </div>
          </div>
          <div>
            <h2>On the day</h2>
            <p>
              Bubble sheet; papers are collected.
              <br />
              No notes or calculators permitted.
            </p>
          </div>
        </div>
        <div className="quiet-callout">
          <strong>This session uses 11 sample questions.</strong> They
          illustrate the style and difficulty; they are not the actual exam
          questions.
        </div>
      </div>
    );
  if (slide.kind === "coverage")
    return (
      <div className="info-content coverage">
        <div className="eyebrow">COVERAGE GUIDE · {slide.part} / 2</div>
        <h1>{slide.title}</h1>
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Topics to revisit</th>
              <th>Likely question styles</th>
            </tr>
          </thead>
          <tbody>
            {coverage
              .slice(slide.part === 1 ? 0 : 4, slide.part === 1 ? 4 : 7)
              .map((w) => (
                <tr key={w.week}>
                  <td>{w.week}</td>
                  <td>{w.topic}</td>
                  <td>{w.styles}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <p className="coverage-note">
          This is the source’s coverage guide. Not every topic has a sample
          question here
          {slide.part === 2
            ? " — no scheduling calculation example is supplied."
            : "."}
        </p>
      </div>
    );
  if (slide.kind === "prep")
    return (
      <div className="info-content">
        <div className="eyebrow">BEFORE THE EXAM</div>
        <h1>
          Prepare to explain,
          <br />
          <em>not just recognise.</em>
        </h1>
        <div className="prep-grid">
          <article>
            <span>01</span>
            <h2>Ask “why?”</h2>
            <p>
              Know why a concept works, not just its name. Explain it aloud in
              your own words.
            </p>
          </article>
          <article>
            <span>02</span>
            <h2>Trace the lab code</h2>
            <p>
              Practise fork(), pthread_create(), and sem_wait()/sem_post().
              Track state one step at a time.
            </p>
          </article>
          <article>
            <span>03</span>
            <h2>Use the course tools</h2>
            <p>
              The source recommends Tool 7.1 and Tool 7.2 for race conditions
              and semaphore traces.
            </p>
            <small>Find them on your course website; no URL is supplied.</small>
          </article>
          <article>
            <span>04</span>
            <h2>Revisit tutorials</h2>
            <p>
              Review all tutorial answer sheets. The source says their format
              and difficulty match the exam.
            </p>
          </article>
        </div>
      </div>
    );
  if (slide.kind === "technique")
    return (
      <div className="info-content">
        <div className="eyebrow">EXAM TECHNIQUE</div>
        <h1>Make each choice count.</h1>
        <div className="technique-layout">
          <div>
            <h2>Read. Eliminate. Decide.</h2>
            <ul className="large-list">
              <li>Watch for NOT and other qualifiers.</li>
              <li>Trace code before choosing an output.</li>
              <li>Check the bubble-sheet question number.</li>
              <li>
                Manage time: 45 ÷ 30 = 90 seconds per question on average.
              </li>
            </ul>
          </div>
          <div className="expectation">
            <h2>Negative marking, precisely</h2>
            <div className="formula">Expected score = p − (1−p)/3</div>
            <p>p is your probability of being correct.</p>
            <div className="odds-row">
              <span>4 equally likely options</span>
              <b>0</b>
            </div>
            <div className="odds-row">
              <span>3 equally likely options</span>
              <b>+⅑</b>
            </div>
            <div className="odds-row">
              <span>2 equally likely options</span>
              <b>+⅓</b>
            </div>
            <small>
              The source advises guessing after eliminating two and leaving
              blank if unsure of all four. Eliminating even one gives positive
              expected value under equal likelihood.
            </small>
          </div>
        </div>
        <p className="coverage-note">
          Positive expected value is an average, not a guarantee for any single
          answer.
        </p>
      </div>
    );
  return (
    <div className="section-slide closing">
      <Botanical hero />
      <div className="section-copy">
        <div className="eyebrow mint">LET’S TALK IT THROUGH</div>
        <h1>
          What can you
          <br />
          now explain?
        </h1>
        <p>
          Pick one idea that clicked.
          <br />
          Pick one you’d like to revisit.
        </p>
        <ul className="closing-takeaways">
          <li>Follow state changes and execution paths.</li>
          <li>Shared data needs deliberate coordination.</li>
          <li>Use the mechanism to justify the answer.</li>
        </ul>
        <div className="closing-credit">
          Adam, James & Bart <span>· CS4023 · University of Limerick</span>
        </div>
      </div>
    </div>
  );
}
