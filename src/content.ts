export type Letter = "A" | "B" | "C" | "D";
export type DiagramKind =
  | "kernel"
  | "states"
  | "thrashing"
  | "threads"
  | "critical"
  | "fork"
  | "race"
  | "wait"
  | "semaphore"
  | "spinlock"
  | "pipe";
export interface ExplanationStep {
  title: string;
  paragraphs: string[];
  diagram?: DiagramKind;
  code?: string;
  takeaway?: string;
}
export interface Question {
  id: string;
  title: string;
  section: number;
  prompt: string;
  code?: string;
  afterCode?: string;
  options: [string, string, string, string];
  answer: Letter;
  reason: string;
  steps: ExplanationStep[];
  misconceptions: Partial<Record<Letter, string>>;
  notes: string;
}
export interface InfoSlide {
  id: string;
  kind:
    | "opening"
    | "how"
    | "exam"
    | "section"
    | "coverage"
    | "prep"
    | "technique"
    | "closing";
  title: string;
  section?: number;
  part?: number;
}
export interface QuestionSlide {
  id: string;
  kind: "question";
  questionId: string;
  title: string;
}
export type Slide = InfoSlide | QuestionSlide;
export const letters: Letter[] = ["A", "B", "C", "D"];
export const sections = [
  {
    title: "Know the concept.",
    label: "Concept / definition",
    description:
      "Read every option. A familiar phrase can still describe the wrong concept.",
    cue: "What makes this concept different?",
    range: "Examples 1.1–1.3",
  },
  {
    title: "Find the exception.",
    label: "“Which is NOT…”",
    description:
      "Spot the negation first. Three statements belong; one is the outlier.",
    cue: "Which claim fails, and why?",
    range: "Examples 2.1–2.2",
  },
  {
    title: "Follow the execution.",
    label: "Code reading / output prediction",
    description:
      "Track each process and thread. Follow return values, shared data, and the order imposed by calls.",
    cue: "What happens next in each execution path?",
    range: "Examples 3.1–3.3",
  },
  {
    title: "Look inside the mechanism.",
    label: "Mechanism / process",
    description:
      "Reason about the state of the system before and after the operation.",
    cue: "Who can make progress now?",
    range: "Examples 4.1–4.3",
  },
];
export const questions: Question[] = [
  {
    id: "1.1",
    title: "Monolithic kernel",
    section: 1,
    prompt: "A monolithic OS kernel is best characterised by:",
    options: [
      "All OS services running as separate user-space servers that communicate via IPC",
      "A small kernel providing only essential services such as IPC and basic scheduling",
      "All OS services (scheduling, file systems, drivers, memory management) running together in kernel space",
      "The OS kernel being split into hardware-specific and hardware-independent layers",
    ],
    answer: "C",
    reason:
      "A monolithic kernel places the main OS services together in kernel space.",
    steps: [
      {
        title: "Where do the services live?",
        paragraphs: [
          "In a monolithic design, scheduling, memory management, file systems, and drivers share the privileged kernel environment.",
          "A microkernel keeps a smaller core and moves many services into user-space servers that communicate through IPC.",
        ],
        diagram: "kernel",
        takeaway:
          "Monolithic: the main services live together in kernel space.",
      },
    ],
    misconceptions: {
      A: "Separate user-space servers communicating through IPC describe a microkernel design.",
      B: "A small IPC-and-scheduling core also fits microkernel descriptions; “nanokernel” terminology varies.",
      D: "Hardware-specific and hardware-independent layers describe an organisation strategy, not the defining monolithic distinction.",
    },
    notes:
      "The source calls B a nanokernel. Avoid treating that label as unique: minimal IPC and scheduling are also characteristic of microkernel descriptions. These diagrams simplify real hybrid architectures.",
  },
  {
    id: "1.2",
    title: "Blocking I/O",
    section: 1,
    prompt:
      "Which process state transition occurs when a running process issues a blocking I/O request?",
    options: [
      "Running → Ready",
      "Ready → Running",
      "Running → Waiting",
      "Waiting → Ready",
    ],
    answer: "C",
    reason:
      "The process must wait for I/O completion before it can use the CPU again.",
    steps: [
      {
        title: "Waiting is different from being ready.",
        paragraphs: [
          "The process issues an I/O request that cannot complete immediately, so the OS takes it off the CPU and marks it Waiting.",
          "When the I/O completes, it becomes Ready. It runs again only when the scheduler dispatches it.",
        ],
        diagram: "states",
        takeaway:
          "Blocking I/O: Running → Waiting; completion: Waiting → Ready.",
      },
    ],
    misconceptions: {
      A: "Running → Ready usually means the process can run but has lost the CPU, for example through preemption.",
      B: "Ready → Running is dispatch by the scheduler, not a blocking request.",
      D: "Waiting → Ready happens when the I/O completes, not when the request begins.",
    },
    notes:
      "A read does not always block. The question explicitly asks about a blocking I/O request. Completion makes the process ready, not necessarily immediately running.",
  },
  {
    id: "1.3",
    title: "Thrashing",
    section: 1,
    prompt:
      "Which of the following best defines thrashing in a virtual memory system?",
    options: [
      "A process’s pages are encrypted before being swapped to disk",
      "The OS spends more time swapping pages in and out than executing useful process instructions",
      "The CPU repeatedly processes the same instruction due to a pipeline stall",
      "A process’s working set exceeds the kernel’s maximum page table size",
    ],
    answer: "B",
    reason:
      "Thrashing means page transfers dominate the time available for useful execution.",
    steps: [
      {
        title: "Busy moving pages. Barely doing work.",
        paragraphs: [
          "When active working sets do not fit in available memory, needed pages are repeatedly evicted and fetched again.",
          "Frequent page faults and transfers leave little time for useful process instructions. Reducing memory pressure can restore progress.",
        ],
        diagram: "thrashing",
        takeaway: "Thrashing is too much paging and too little useful work.",
      },
    ],
    misconceptions: {
      A: "Encryption is a security operation, not the defining cause or symptom of thrashing.",
      C: "A pipeline stall concerns CPU instruction execution, not repeated virtual-memory page transfers.",
      D: "The key problem is insufficient resident memory for active working sets, not a maximum page-table size.",
    },
    notes:
      "The visual is a qualitative comparison, not a measured performance trace. Thrashing can arise from competing processes and memory overcommitment.",
  },
  {
    id: "2.1",
    title: "Threads & fault isolation",
    section: 2,
    prompt:
      "Which of the following is NOT a valid reason to prefer threads over processes for a concurrent server application?",
    options: [
      "Threads share heap memory, making data sharing between units of work cheaper",
      "Thread creation is faster than process creation because no address space is duplicated",
      "Using threads guarantees that a bug in one connection handler cannot crash the server",
      "Context-switching between threads of the same process is less expensive than between separate processes",
    ],
    answer: "C",
    reason:
      "Threads share an address space, so one faulty handler can damage the whole process.",
    steps: [
      {
        title: "Sharing also shares the risk.",
        paragraphs: [
          "Threads have their own stacks and execution state, but share the process’s heap and address space.",
          "A bad write in one handler can corrupt data used by another. Separate processes generally provide stronger memory fault isolation.",
        ],
        diagram: "threads",
        takeaway:
          "Threads make sharing cheaper; they do not guarantee fault isolation.",
      },
    ],
    misconceptions: {
      A: "This is a valid advantage: shared heap data can be accessed without a separate IPC channel.",
      B: "This is a typical advantage in the course model: creating a thread does not create a separate address space.",
      D: "This is a typical advantage: same-process threads share an address-space context, reducing switching overhead.",
    },
    notes:
      "B and D describe typical costs, not universal performance guarantees. Process creation may use copy-on-write rather than eagerly duplicate memory. Threads cannot guarantee that a bug stays within one handler.",
  },
  {
    id: "2.2",
    title: "Critical-section requirements",
    section: 2,
    prompt:
      "Which of the following is NOT one of the three standard requirements for a correct critical-section solution?",
    options: [
      "Mutual exclusion — at most one process may be in the critical section at any time",
      "Progress — if no process is in the critical section, one of the waiting processes must eventually enter",
      "Bounded waiting — there is a limit on how many times other processes can enter before a waiting process is admitted",
      "Preemptability — a process inside the critical section may be forcibly removed by the OS if a higher-priority process arrives",
    ],
    answer: "D",
    reason:
      "The three classic requirements are mutual exclusion, progress, and bounded waiting.",
    steps: [
      {
        title: "Safety, progress, and a limit on waiting.",
        paragraphs: [
          "Mutual exclusion protects shared state. Progress prevents entry decisions from being postponed indefinitely when entry is possible.",
          "Bounded waiting limits how often others may enter after a process requests entry. Preemption is a scheduling policy, not a fourth requirement.",
        ],
        diagram: "critical",
        takeaway:
          "Remember the three: mutual exclusion, progress, bounded waiting.",
      },
    ],
    misconceptions: {
      A: "This is required: two processes must not execute the protected critical section together.",
      B: "This is required: when entry is possible, choosing the next entrant must make progress.",
      C: "This is required: a requester must not be overtaken without a bound.",
    },
    notes:
      "The source’s progress wording is simplified. The classic condition also excludes processes outside their entry/critical sections from influencing the choice. Bounded waiting assumes participating processes continue to make progress.",
  },
  {
    id: "3.1",
    title: "Two fork calls",
    section: 3,
    prompt: "Consider this program (assume it runs without errors):",
    code: '#include <stdio.h>\n#include <unistd.h>\n\nint main(void) {\n    fork();\n    fork();\n    printf("*\\n");\n    return 0;\n}',
    afterCode: "How many times is * printed?",
    options: ["1", "2", "4", "8"],
    answer: "C",
    reason:
      "Both processes execute the second fork, leaving four processes to print once each.",
    steps: [
      {
        title: "Each existing process reaches the next fork.",
        paragraphs: [
          "The first fork creates a child: now two processes continue after the call.",
          "Both call fork again. Each creates one child, so four processes reach printf. They each print one star; their order is unspecified.",
        ],
        diagram: "fork",
        takeaway: "Two unconditional successful forks: 1 → 2 → 4 processes.",
      },
    ],
    misconceptions: {
      A: "The child continues execution too; printing is not restricted to the original parent.",
      B: "Two counts only the first fork and misses the children created by the second.",
      D: "Eight would require a third doubling; this code calls fork twice on each applicable path.",
    },
    notes:
      "Assume successful forks, as stated. There is no output before the forks to be duplicated in a stdio buffer. This trace is a conceptual process tree, not execution of C.",
  },
  {
    id: "3.2",
    title: "Unsynchronised increments",
    section: 3,
    prompt: "What does this code print?",
    code: '#include <stdio.h>\n#include <pthread.h>\n\nint x = 0;\nvoid *inc(void *arg) {\n    x++;\n    return NULL;\n}\nint main(void) {\n    pthread_t t1, t2;\n    pthread_create(&t1, NULL, inc, NULL);\n    pthread_create(&t2, NULL, inc, NULL);\n    pthread_join(t1, NULL);\n    pthread_join(t2, NULL);\n    printf("%d\\n", x);\n    return 0;\n}',
    options: [
      "Always 2",
      "Always 1",
      "Either 1 or 2 — the result is non-deterministic",
      "The program deadlocks on pthread_join",
    ],
    answer: "C",
    reason:
      "C is the supplied expected answer: a simplified interleaving can lose an update, but real C has undefined behaviour.",
    steps: [
      {
        title: "How an update gets lost.",
        paragraphs: [
          "In a simplified model, x++ reads x, adds one locally, and writes the result. If both threads read 0, both may write 1.",
          "If one whole increment finishes before the other reads, the model ends at 2. pthread_join waits for completion; it does not lock the increments.",
        ],
        diagram: "race",
        takeaway:
          "Waiting for both threads is not the same as protecting shared data.",
      },
      {
        title: "The C rule, and a mutex-based fix.",
        paragraphs: [
          "Conflicting unsynchronised accesses to an ordinary C variable are a data race and cause undefined behaviour. Actual C execution is not guaranteed to print only 1 or 2.",
          "Optional fix: hold the same mutex across the entire increment in both threads. Keep the joins before reading the final result.",
        ],
        code: "pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;\n\nvoid *inc(void *arg) {\n    pthread_mutex_lock(&lock);\n    x++;\n    pthread_mutex_unlock(&lock);\n    return NULL;\n}",
        takeaway: "Protect the whole read–modify–write operation.",
      },
    ],
    misconceptions: {
      A: "Join does not prevent the two increments from conflicting; “always 2” is not guaranteed.",
      B: "A lost update illustrates 1, but even the simplified model can produce 2.",
      D: "These joins wait for terminating worker threads. There is no cyclic wait shown; the shared-variable race is the problem.",
    },
    notes:
      "Retain answer C for cross-reference with the supplied answer key. It is an illustrative teaching answer, not a complete specification of real C behaviour. C11 draft N1570 §5.1.2.4 paragraph 25 defines data races and their undefined behaviour. The mutex code is a replacement worker plus shared declaration, not a complete standalone program. Assume successful pthread calls.",
  },
  {
    id: "3.3",
    title: "Ordering with wait",
    section: 3,
    prompt: "What is the output of this program?",
    code: '#include <stdio.h>\n#include <stdlib.h>\n#include <sys/wait.h>\n#include <unistd.h>\n\nint main(void) {\n    pid_t pid = fork();\n    if (pid < 0) { exit(1); }\n    if (pid == 0) {\n        printf("child\\n");\n        exit(0);\n    }\n    wait(NULL);\n    printf("parent\\n");\n    return 0;\n}',
    options: [
      "parent then child",
      "child then parent",
      "child and parent in non-deterministic order",
      "Only parent — the child is never scheduled",
    ],
    answer: "B",
    reason:
      "The parent passes wait only after the child has printed and exited.",
    steps: [
      {
        title: "A wait creates an ordering constraint.",
        paragraphs: [
          "fork returns 0 in the child, so the child prints and exits. The parent skips that branch and calls wait.",
          "If the child is still running, the parent blocks. If it has already exited, wait can return immediately. Either way, successful wait places the parent’s print after child exit.",
        ],
        diagram: "wait",
        takeaway: "Successful wait: child exits before the parent continues.",
      },
    ],
    misconceptions: {
      A: "The parent’s printf is after wait, so it cannot precede the child’s completed exit in the intended successful execution.",
      C: "Scheduling varies, but wait imposes the ordering relevant to these prints.",
      D: "The child follows the pid == 0 branch and prints; wait does not suppress its execution.",
    },
    notes:
      "The expected answer assumes successful fork/wait and no signal interruption. Real robust code checks wait’s return value and retries as needed for EINTR. exit flushes the child’s standard I/O stream. Preserve the supplied code unchanged apart from whitespace.",
  },
  {
    id: "4.1",
    title: "Posting a semaphore",
    section: 4,
    prompt:
      "A process calls sem_post() (V operation) on a semaphore that currently has two threads waiting in its queue. What happens?",
    options: [
      "The semaphore value increments by one and exactly one waiting thread is unblocked",
      "The semaphore value increments by one for each waiting thread, and both are unblocked",
      "All waiting threads are unblocked simultaneously (broadcast behaviour)",
      "The call has no effect because the semaphore already has threads waiting",
    ],
    answer: "A",
    reason:
      "One post supplies one permit, allowing one waiting thread to proceed.",
    steps: [
      {
        title: "One post. One permit.",
        paragraphs: [
          "A successful sem_post releases one permit. With waiters present, one can complete sem_wait; the other still needs a permit.",
          "The awakened waiter may consume the permit immediately. The observable count need not remain increased, and POSIX does not require universal FIFO wake-up ordering.",
        ],
        diagram: "semaphore",
        takeaway: "A post is one permit, not a broadcast.",
      },
    ],
    misconceptions: {
      B: "The number of waiters does not multiply the permit: one call adds one.",
      C: "A semaphore post does not broadcast to every waiting thread.",
      D: "Waiting threads are exactly the situation in which releasing a permit can let one proceed.",
    },
    notes:
      "The source says FIFO in POSIX; that is not a universal guarantee. Selection follows applicable scheduling policies and parameters; specified real-time policies include priority and waiting-time rules. The diagram’s selected waiter is illustrative, not a promised queue order. Permit accounting may be immediately consumed.",
  },
  {
    id: "4.2",
    title: "Spinning on one core",
    section: 4,
    prompt: "Why does a spinlock perform poorly on a single-core system?",
    options: [
      "On a single core, the CPU cannot execute atomic instructions",
      "The lock-holder is preempted while the spinner occupies the CPU, preventing the holder from ever releasing the lock without a timer interrupt",
      "Spinlocks require hardware support not present on single-core CPUs",
      "The OS disables spinlocks on single-core systems because they cause deadlock",
    ],
    answer: "B",
    reason:
      "The spinner uses the only CPU while the preempted lock-holder cannot run to release the lock.",
    steps: [
      {
        title: "The wrong thread is using the CPU.",
        paragraphs: [
          "If the lock-holder is preempted, the spinner runs and keeps checking the locked value.",
          "On one core, the holder cannot run at the same time. A timer interrupt or another scheduling event must let it resume and release the lock. Spinning uses CPU time without helping the holder.",
        ],
        diagram: "spinlock",
        takeaway: "A spinner cannot help a holder that is not running.",
      },
    ],
    misconceptions: {
      A: "Single-core CPUs can support atomic instructions; the problem is wasted execution time.",
      C: "Multiple cores are not a prerequisite for the hardware operations used by locks.",
      D: "Spinlocks are not universally disabled. Behaviour depends on preemption, context, and the implementation.",
    },
    notes:
      "The source’s “blocking mutexes are always preferable” is too broad. In this preempted-holder scenario, blocking avoids spending a quantum spinning. Very short kernel critical sections and interrupt/preemption rules may justify other choices. Do not generalise to every single-core context.",
  },
  {
    id: "4.3",
    title: "A pipe with no readers",
    section: 4,
    prompt:
      "In the POSIX pipe() model, what happens when a writer writes to a pipe whose read end has been closed by all readers?",
    options: [
      "The write blocks until a new reader opens the pipe",
      "The write succeeds silently and data is buffered in the kernel",
      "The writer process receives SIGPIPE and the write returns EPIPE",
      "The kernel closes the write end automatically",
    ],
    answer: "C",
    reason:
      "The write generates SIGPIPE; if execution continues, it fails with errno set to EPIPE.",
    steps: [
      {
        title: "No read ends left open.",
        paragraphs: [
          "All read-end descriptors must be closed, including inherited copies. A reader merely being idle is not enough.",
          "Default SIGPIPE handling can terminate the writer. If SIGPIPE is ignored or an appropriate handler lets execution continue, write returns −1 with errno = EPIPE.",
        ],
        diagram: "pipe",
        takeaway: "No open read ends: SIGPIPE; if execution continues, EPIPE.",
      },
    ],
    misconceptions: {
      A: "No open read end triggers the broken-pipe condition; it does not wait for a new reader.",
      B: "The kernel does not silently accept this write into a pipe with no readers.",
      D: "The write-end descriptor is not automatically closed as the answer claims; the signal/error is the defined response.",
    },
    notes:
      "The source shorthand “write returns EPIPE” means a return of −1 with errno = EPIPE. With the default signal action the process can terminate before observing that return. Count all read-end descriptor copies across processes, including copies inherited through fork.",
  },
];
export const coverage = [
  {
    week: "W1",
    topic:
      "OS overview, OS types, kernel architectures (monolithic, microkernel, hybrid)",
    styles: "Concept, NOT",
  },
  {
    week: "W2",
    topic:
      "Interrupts, DMA, OS architecture, system calls and their categories",
    styles: "Concept, Mechanism",
  },
  {
    week: "W3",
    topic: "Processes, PCB, fork/exec/wait, context switch",
    styles: "Concept, Code reading",
  },
  {
    week: "W4",
    topic: "Threads, pthreads, threading models, OpenMP",
    styles: "Concept, Code reading, NOT",
  },
  {
    week: "W5",
    topic: "Pipes, shared memory, message passing, sockets",
    styles: "Concept, Mechanism",
  },
  {
    week: "W6",
    topic: "FCFS, SJF, SRTF, Round Robin, priority, ageing",
    styles: "Concept, Calculation-style",
  },
  {
    week: "W7",
    topic:
      "Race conditions, critical sections, Peterson’s, semaphores, priority inversion",
    styles: "Concept, Code reading, Mechanism",
  },
];
export const deck: Slide[] = [
  { id: "opening", kind: "opening", title: "CS4023 Midterm Preparation" },
  { id: "how", kind: "how", title: "How we’ll learn together" },
  { id: "exam", kind: "exam", title: "Know the exam format" },
  ...sections.flatMap((s, i): Slide[] => [
    { id: `section-${i + 1}`, kind: "section", section: i + 1, title: s.label },
    ...questions
      .filter((q) => q.section === i + 1)
      .map((q) => ({
        id: `example-${q.id}`,
        kind: "question" as const,
        questionId: q.id,
        title: `Example ${q.id} · ${q.title}`,
      })),
  ]),
  {
    id: "coverage-1",
    kind: "coverage",
    title: "Weeks 1–4 · The foundations",
    part: 1,
  },
  {
    id: "coverage-2",
    kind: "coverage",
    title: "Weeks 5–7 · Cooperation & coordination",
    part: 2,
  },
  { id: "prep", kind: "prep", title: "Prepare to explain, not just recognise" },
  { id: "technique", kind: "technique", title: "Make each choice count" },
  { id: "closing", kind: "closing", title: "What can you now explain?" },
];
