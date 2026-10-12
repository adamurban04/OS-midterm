import type { DiagramKind } from "./content";
export function Botanical({ hero = false }: { hero?: boolean }) {
  return (
    <svg
      className={`botanical ${hero ? "hero-botanical" : ""}`}
      viewBox="0 0 600 700"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="leaf"
          x1="100"
          y1="650"
          x2="540"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C5DB82" />
          <stop offset=".5" stopColor="#65DBC5" />
          <stop offset="1" stopColor="#0F8B8D" />
        </linearGradient>
      </defs>
      <g
        stroke="url(#leaf)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M288 710V400Q295 210 390 30Q485 180 422 280Q377 347 303 402"
          fill="#65DBC5"
          fillOpacity=".045"
        />
        <path d="M300 418Q316 247 390 30M325 288L377 226L410 175M337 235L366 179L385 110M313 339L378 289L412 234M321 300L295 243L313 172M337 235L333 171L360 97M354 170L359 120" />
        <path
          d="M288 553Q176 535 94 338Q261 342 286 441Q296 491 288 553Z"
          fill="#C5DB82"
          fillOpacity=".04"
        />
        <path d="M95 338Q207 447 288 553M166 416L162 372M194 450L230 432L248 437M220 484L216 419M245 515L271 492M135 379L175 389" />
        <path
          d="M291 628Q338 487 538 385Q510 595 391 625Q340 641 291 628Z"
          fill="#65DBC5"
          fillOpacity=".05"
        />
        <path d="M292 628Q405 522 538 385M365 561L392 480L430 453M408 521L481 503L500 468M334 594L414 599L456 569M448 478L465 431M376 550L445 544" />
        <path d="M270 700V568L229 527H170L130 487H36M255 700V590L221 556H142L83 497H0M235 700V621L196 582H112L63 533H0M310 700V665L356 652H435L496 591H600M327 700V683L362 667H458L518 607H600M347 700L374 682H477L538 621H600M281 383V270L240 229V81M267 394V281L223 237V0M250 402V294L204 248V33M302 399L450 322H510L555 277V61M308 377L451 300H495L534 261V0M318 347L452 280H479L514 245V92" />
        <path d="M173 313H96L56 273V188M181 298H108L77 267V137M156 283H122L98 259V207M439 650H549L580 681M430 663H535L565 696" />
        {[
          [240, 81],
          [204, 33],
          [514, 92],
          [555, 61],
          [56, 188],
          [77, 137],
          [98, 207],
          [36, 487],
          [63, 533],
          [580, 681],
          [565, 696],
          [174, 313],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" fill="#062536" />
        ))}
        <circle cx="288" cy="567" r="9" />
        <circle cx="288" cy="567" r="4" />
        <circle cx="302" cy="402" r="7" />
      </g>
    </svg>
  );
}
const Box = ({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) => <div className={`diagram-box ${accent ? "accent" : ""}`}>{children}</div>;
const Arrow = ({ label }: { label?: string }) => (
  <div className="diagram-arrow">
    <small>{label}</small>
    <span>→</span>
  </div>
);
export function Diagram({ kind }: { kind: DiagramKind }) {
  return (
    <figure className="diagram" data-testid="solution-diagram">
      <figcaption>Conceptual model · not execution of C code</figcaption>
      {kind === "kernel" && (
        <div className="kernel-comparison">
          <div>
            <h4>Monolithic</h4>
            <div className="space user">User space · applications</div>
            <div className="space kernel">
              <strong>Kernel space</strong>
              <div className="service-grid">
                <span>Scheduling</span>
                <span>Memory</span>
                <span>File systems</span>
                <span>Drivers</span>
              </div>
            </div>
          </div>
          <div>
            <h4>Microkernel</h4>
            <div className="space user">
              User space
              <div className="service-grid">
                <span>File server</span>
                <span>Driver server</span>
              </div>
            </div>
            <div className="space kernel">
              <strong>Small kernel</strong>
              <p>IPC · basic scheduling</p>
            </div>
          </div>
        </div>
      )}
      {kind === "states" && (
        <>
          <div className="diagram-flow">
            <Box>
              Running
              <br />
              <small>Using the CPU</small>
            </Box>
            <Arrow label="Blocking I/O" />
            <Box accent>
              Waiting
              <br />
              <small>I/O unfinished</small>
            </Box>
            <Arrow label="I/O complete" />
            <Box>
              Ready
              <br />
              <small>Eligible for CPU</small>
            </Box>
          </div>
          <p className="diagram-caption">
            Ready → Running requires a scheduler dispatch.
          </p>
        </>
      )}
      {kind === "thrashing" && (
        <div className="paging">
          <div>
            <strong>Healthy memory use</strong>
            <div className="timebar healthy">
              <span>Useful execution</span>
              <i>Paging</i>
            </div>
          </div>
          <div>
            <strong>Thrashing</strong>
            <div className="timebar thrash">
              <span>Work</span>
              <i>Repeated page transfers</i>
            </div>
          </div>
          <p className="diagram-caption">
            Illustrative proportions · memory ⇄ backing store
          </p>
        </div>
      )}
      {kind === "threads" && (
        <div className="process-diagram">
          <strong>One process · one shared address space</strong>
          <div className="thread-row">
            <Box>
              Thread 1<br />
              <small>Own stack</small>
            </Box>
            <Box>
              Thread 2<br />
              <small>Own stack</small>
            </Box>
            <Box>
              Thread 3<br />
              <small>Own stack</small>
            </Box>
          </div>
          <div className="shared-memory">
            Shared heap & global data
            <br />
            <small>A faulty write can affect every thread.</small>
          </div>
        </div>
      )}
      {kind === "critical" && (
        <div className="three-diagram">
          <Box accent>
            <b>1 at a time</b>
            <span>Mutual exclusion</span>
          </Box>
          <Box>
            <b>Keep moving</b>
            <span>Progress</span>
          </Box>
          <Box>
            <b>Limit overtaking</b>
            <span>Bounded waiting</span>
          </Box>
        </div>
      )}
      {kind === "fork" && (
        <svg
          className="fork-tree"
          viewBox="0 0 720 250"
          role="img"
          aria-label="One process becomes two after the first fork, then four after the second. Each of four prints one star."
        >
          <g stroke="#0F8B8D" strokeWidth="2" fill="none">
            <path d="M90 125L310 65M90 125L310 185M310 65L565 30M310 65L565 95M310 185L565 155M310 185L565 220" />
          </g>
          <g fill="#062536">
            {[
              [90, 125],
              [310, 65],
              [310, 185],
              [565, 30],
              [565, 95],
              [565, 155],
              [565, 220],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="22" />
            ))}
          </g>
          <g fill="#F6F8EF" fontSize="20" textAnchor="middle">
            <text x="90" y="132">
              P
            </text>
            <text x="310" y="72">
              P
            </text>
            <text x="310" y="192">
              C
            </text>
            {[30, 95, 155, 220].map((y) => (
              <text key={y} x="565" y={y + 7}>
                *
              </text>
            ))}
          </g>
          <g fill="#17343B" fontSize="21">
            <text x="150" y="232">
              first fork
            </text>
            <text x="365" y="245">
              second fork
            </text>
            <text x="615" y="132">
              4 prints
            </text>
          </g>
        </svg>
      )}
      {kind === "race" && (
        <div className="race-trace">
          <table>
            <thead>
              <tr>
                <th>Step</th>
                <th>Thread 1</th>
                <th>Thread 2</th>
                <th>x</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Read 0</td>
                <td>—</td>
                <td>0</td>
              </tr>
              <tr>
                <td>2</td>
                <td>—</td>
                <td>Read 0</td>
                <td>0</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Write 1</td>
                <td>—</td>
                <td>1</td>
              </tr>
              <tr>
                <td>4</td>
                <td>—</td>
                <td>Write 1</td>
                <td>1</td>
              </tr>
            </tbody>
          </table>
          <p className="diagram-caption">
            Serial model: read 0 → write 1 → read 1 → write 2.
          </p>
        </div>
      )}
      {kind === "wait" && (
        <div className="wait-trace">
          <div>
            <strong>Child</strong>
            <span className="timeline active">printf("child") → exit(0)</span>
          </div>
          <div>
            <strong>Parent</strong>
            <span className="timeline">wait(NULL) · blocked until exit</span>
            <span className="timeline active">printf("parent")</span>
          </div>
        </div>
      )}
      {kind === "semaphore" && (
        <>
          <div className="diagram-flow">
            <Box>
              sem_post()
              <br />
              <small>One permit</small>
            </Box>
            <Arrow />
            <Box accent>
              One waiter
              <br />
              <small>Can proceed</small>
            </Box>
            <Box>
              Other waiter
              <br />
              <small>Still waiting</small>
            </Box>
          </div>
          <p className="diagram-caption">
            Waiter selection is illustrative; scheduling rules determine the
            choice.
          </p>
        </>
      )}
      {kind === "spinlock" && (
        <div className="spin-model">
          <div className="core">
            <small>Only CPU core</small>
            <strong>Spinner running</strong>
            <span>Check → locked → check</span>
          </div>
          <div className="holder">
            <strong>Holder preempted</strong>
            <p>Owns the lock, but cannot run to release it.</p>
          </div>
          <p className="diagram-caption">
            A scheduling event lets the holder run again.
          </p>
        </div>
      )}
      {kind === "pipe" && (
        <>
          <div className="diagram-flow">
            <Box>
              Writer
              <br />
              <small>write(fd, …)</small>
            </Box>
            <Arrow />
            <Box accent>
              Pipe
              <br />
              <small>0 open read ends</small>
            </Box>
            <Box>
              All read copies
              <br />
              <small>Closed ×</small>
            </Box>
          </div>
          <div className="pipe-results">
            <span>Default SIGPIPE → termination</span>
            <span>If execution continues → −1, errno = EPIPE</span>
          </div>
        </>
      )}
    </figure>
  );
}
