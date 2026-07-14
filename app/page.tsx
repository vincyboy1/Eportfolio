"use client";

import { useEffect, useMemo, useState } from "react";

type Module = {
  id: string;
  task: string;
  icon: string;
  title: string;
  hook: string;
  points: string[];
  challenge: string;
};

type Question = {
  topic: string;
  prompt: string;
  options: string[];
  answer: number;
  why: string;
};

const modules: Module[] = [
  {
    id: "symbols",
    task: "Tasks 1-2",
    icon: "⚡",
    title: "Symbol scanner",
    hook: "Legend first, guess never.",
    points: [
      "The same device can have architectural, wiring, and schematic symbols.",
      "Use the drawing legend when a designer's symbol library is unfamiliar.",
      "Read common symbols: switches, receptacles, batteries, contacts, ground, resistors, meters, and transformers.",
    ],
    challenge: "What letter is commonly used as the reference designation for a resistor?",
  },
  {
    id: "diagrams",
    task: "Tasks 2-4",
    icon: "🗺️",
    title: "Diagram decoder",
    hook: "Operation = schematic. Installation = wiring. Distribution = one-line.",
    points: [
      "A schematic explains electrical relationships and circuit operation, not physical placement.",
      "A wiring (connection) diagram shows terminals, physical layout, cable routing, and actual connections.",
      "A single-line diagram simplifies distribution: one line can stand for several conductors and omits the return path.",
    ],
    challenge: "Which diagram is best when you need to understand how a circuit operates?",
  },
  {
    id: "conversion",
    task: "Tasks 3 & 6",
    icon: "🔁",
    title: "Circuit translator",
    hook: "Trace the loop, number the wire, then simplify the story.",
    points: [
      "Point-to-point diagrams draw a separate line for each wire.",
      "Highway or trunk-line diagrams use one line for a grouped cable or harness, with breakouts to terminals.",
      "To convert wiring to schematic, number the path from the source through components and back to the source.",
    ],
    challenge: "What information is commonly used to make wiring connections easier to follow?",
  },
  {
    id: "views",
    task: "Tasks 5 & 7",
    icon: "🧊",
    title: "3D-to-2D views",
    hook: "Pictorial helps you picture it; orthographic helps you build it.",
    points: [
      "The three main pictorial styles are oblique, isometric, and perspective.",
      "Orthographic views are true two-dimensional views. Designers use as many as needed; front, top, and right-side are common.",
      "Detail and assembly drawings use orthographic information to communicate machines and equipment precisely.",
    ],
    challenge: "Which representation is best for exact fabrication information?",
  },
  {
    id: "drawing-skills",
    task: "Tasks 8-9",
    icon: "📐",
    title: "Line & scale lab",
    hook: "Line style carries meaning. Scale changes the sketch, not the real dimension.",
    points: [
      "Visible: heavy continuous. Hidden: thin equal dashes. Centre: alternating long and short dashes.",
      "In a 1:10 scale, 1 refers to the drawing and 10 to the real object. Written dimensions remain real-world dimensions.",
      "Working detail drawings give construction information; assembly drawings show how parts fit together and use a parts list.",
    ],
    challenge: "Which line type marks a feature that cannot be seen in the current view?",
  },
  {
    id: "prints",
    task: "Tasks 10-11",
    icon: "🏗️",
    title: "Print navigator",
    hook: "Index to find it. Title block to trust it. Revision box to date it.",
    points: [
      "Major print divisions commonly include architectural, structural, mechanical, plumbing, and electrical.",
      "An index page works like a table of contents; E3 is the third drawing in the electrical division.",
      "The title block is normally lower-right. The newest revision is at the top of the revision box.",
    ],
    challenge: "Where would you look first for the consulting engineer's name?",
  },
  {
    id: "electrical-plans",
    task: "Tasks 11-13",
    icon: "🏢",
    title: "Electrical plans",
    hook: "Site for service, floor for fixtures, riser for floors, schedule for details.",
    points: [
      "Electrical site plans locate incoming service, poles, manholes, buried conduit/cable, service equipment, and exterior lighting.",
      "Floor plans show layout of power, lighting, emergency systems, fire alarm, and special systems. Large projects may split these into separate plans.",
      "Schedules present notes in tables; specifications take precedence when they conflict with a drawing.",
    ],
    challenge: "Which plan is your quickest route to the point where power enters a property?",
  },
  {
    id: "manuals-takeoff",
    task: "Tasks 14-16",
    icon: "🧰",
    title: "Manuals & takeoffs",
    hook: "Read before you install. Count before you order. Code before you commit.",
    points: [
      "Manuals commonly organize safety, models, assembly, installation, programming, operation, maintenance, troubleshooting, warranty, and contacts.",
      "Use installation instructions for rough-in locations; use equipment manuals for the full operating and maintenance story.",
      "A material takeoff counts every system's devices, panels, breakers, cable/conduit, boxes, and small hardware. A CSA box is required at a splice, device, or conduit pull point.",
    ],
    challenge: "What is the purpose of a material takeoff?",
  },
];

const questions: Question[] = [
  {
    topic: "Symbols",
    prompt: "A symbol on a drawing looks unfamiliar. What is the safest first move?",
    options: ["Check the drawing legend", "Assume it is a receptacle", "Measure it with a scale", "Ignore it until rough-in"],
    answer: 0,
    why: "Symbols can vary between designers. The legend is the drawing's source of truth.",
  },
  {
    topic: "Schematic",
    prompt: "What is the main purpose of a schematic diagram?",
    options: ["Show circuit operation", "Show exact cable routing", "Show a building elevation", "List materials"],
    answer: 0,
    why: "Schematics show the electrical relationship of components and make current flow easier to follow.",
  },
  {
    topic: "Wiring",
    prompt: "A wiring diagram is also commonly called a:",
    options: ["Connection diagram", "Riser diagram", "Detail drawing", "Schedule"],
    answer: 0,
    why: "It shows how components and their terminals are physically connected.",
  },
  {
    topic: "Schematic",
    prompt: "In a schematic, a dashed line usually represents:",
    options: ["A mechanical linkage", "A grounded conductor", "A hidden wall", "A power circuit"],
    answer: 0,
    why: "A dashed line indicates a mechanical or physical connection between components.",
  },
  {
    topic: "Schematic",
    prompt: "What does a dot at a multiple wire junction show?",
    options: ["Electrical connection", "A crossover with no connection", "A break in the conductor", "A reference line"],
    answer: 0,
    why: "The dot makes an electrical connection unmistakable at a multiple junction.",
  },
  {
    topic: "Single-line",
    prompt: "Which statement about a single-line diagram is true?",
    options: ["It shows the supply side and usually omits the return path", "It always draws every conductor separately", "It shows only physical device locations", "It is only for electronics"],
    answer: 0,
    why: "A one-line simplifies distribution; each line can represent several conductors.",
  },
  {
    topic: "Riser",
    prompt: "A power riser is especially useful for showing:",
    options: ["Distribution through a building's floors", "The exact wire colour at a switch", "An object in perspective", "The material count"],
    answer: 0,
    why: "A riser is an elevation-style view of related equipment and its vertical distribution.",
  },
  {
    topic: "Wiring",
    prompt: "In a highway-type wiring diagram, a single main line represents:",
    options: ["A group of wires in a common raceway or harness", "One exact conductor only", "A reference grid", "A revision"],
    answer: 0,
    why: "Individual conductors break out from the trunk line to their connection points.",
  },
  {
    topic: "Views",
    prompt: "Which is NOT one of the three main pictorial drawing styles?",
    options: ["Orthographic", "Oblique", "Isometric", "Perspective"],
    answer: 0,
    why: "Orthographic is a separate two-dimensional projection method, not a pictorial style.",
  },
  {
    topic: "Orthographic",
    prompt: "Why are orthographic projections valuable for fabrication?",
    options: ["They show true two-dimensional views with dimensions", "They look more realistic", "They only need one view", "They avoid notes"],
    answer: 0,
    why: "They communicate precise size, shape, and relationship information needed to build an object.",
  },
  {
    topic: "Lines",
    prompt: "A hidden line is normally drawn as:",
    options: ["A thin broken line with equal dashes", "A heavy continuous line", "Alternating long and short dashes", "A 45-degree hatch"],
    answer: 0,
    why: "Heavy continuous lines are visible lines; long-short dash patterns are centre lines.",
  },
  {
    topic: "Scale",
    prompt: "In the scale 1:10, the first number refers to:",
    options: ["The drawing", "The real object", "The page number", "The revision number"],
    answer: 0,
    why: "Scale is written drawing:actual object. The printed dimensions still state actual size.",
  },
  {
    topic: "Working drawings",
    prompt: "What does a working assembly drawing mainly show?",
    options: ["How individual parts fit together", "Every construction dimension", "Only electrical symbols", "The building site"],
    answer: 0,
    why: "Assembly drawings identify parts and show how they go together; detail drawings provide construction dimensions.",
  },
  {
    topic: "Prints",
    prompt: "What is the construction-print equivalent of a book's table of contents?",
    options: ["Index page", "Title block", "Legend", "Specification"],
    answer: 0,
    why: "The index lists sheets by division and number so you can locate the correct drawing fast.",
  },
  {
    topic: "Prints",
    prompt: "Where is a title block normally located?",
    options: ["Lower-right corner", "Upper-left corner", "Centre of the drawing", "On the site plan only"],
    answer: 0,
    why: "The title block identifies the sheet, project, people, date, and related revision information.",
  },
  {
    topic: "Prints",
    prompt: "On a revision box, where is the most recent revision normally found?",
    options: ["At the top", "At the bottom", "In the legend", "On the index page"],
    answer: 0,
    why: "Revisions are listed bottom-to-top so the latest change is easiest to find.",
  },
  {
    topic: "Electrical plans",
    prompt: "Where would you look first to find the incoming electrical service location?",
    options: ["Electrical site/plot plan", "Reflected ceiling plan", "Assembly drawing", "Manual warranty section"],
    answer: 0,
    why: "The site plan carries service, pole, manhole, buried conduit, and exterior information.",
  },
  {
    topic: "Electrical plans",
    prompt: "If a drawing and specification disagree, which information is usually taken as correct?",
    options: ["The specification", "The drawing", "Whichever was printed first", "The contractor's memory"],
    answer: 0,
    why: "Specifications are the written requirements and normally govern in a conflict.",
  },
  {
    topic: "Manuals",
    prompt: "Which manual section is most useful when placing conduits and wires for rough-in?",
    options: ["Installation", "Warranty", "Operation", "Maintenance"],
    answer: 0,
    why: "Installation instructions contain the placement, assembly, dimensions, and step-by-step setup details.",
  },
  {
    topic: "Manuals",
    prompt: "Which three words commonly flag safety information in manuals?",
    options: ["Warning, Caution, Danger", "Start, Stop, Reset", "On, Off, Test", "Plan, Build, Inspect"],
    answer: 0,
    why: "These signal words call attention to worker and equipment safety hazards.",
  },
  {
    topic: "Takeoff",
    prompt: "A material takeoff is used to:",
    options: ["Count the type and quantity of materials required", "Measure only room height", "Replace the electrical code", "Draw a one-line diagram"],
    answer: 0,
    why: "A complete takeoff looks through each electrical system and counts devices, cable, panels, breakers, boxes, and hardware.",
  },
  {
    topic: "Takeoff",
    prompt: "When is a CSA-approved electrical box required?",
    options: ["At a splice, device connection, or conduit pull point", "Only outdoors", "Only above a panel", "Only for low voltage"],
    answer: 0,
    why: "Boxes protect and contain splices, device connections, and pull points.",
  },
  {
    topic: "Symbols",
    prompt: "In a reference designation such as R1, what does the R identify?",
    options: ["Resistor", "Receptacle", "Riser", "Revision"],
    answer: 0,
    why: "Letters identify component type, while numbers distinguish several similar components.",
  },
  {
    topic: "Schematic",
    prompt: "When possible, switch and relay contacts are drawn in which state?",
    options: ["De-energized / non-operated", "Fully loaded", "Physically installed", "At maximum voltage"],
    answer: 0,
    why: "This is a key schematic convention that keeps circuit logic predictable.",
  },
];

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function Home() {
  const [activeModule, setActiveModule] = useState(modules[0].id);
  const [completed, setCompleted] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(8 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [quickQuestion, setQuickQuestion] = useState(0);
  const [quickAnswer, setQuickAnswer] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [mockSet, setMockSet] = useState<Question[]>([]);
  const [mockIndex, setMockIndex] = useState(0);
  const [mockAnswer, setMockAnswer] = useState<number | null>(null);
  const [mockScore, setMockScore] = useState(0);
  const [mockDone, setMockDone] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("circuit-sprint-progress");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as { completed?: string[]; streak?: number };
      setCompleted(parsed.completed ?? []);
      setStreak(parsed.streak ?? 0);
    } catch {
      window.localStorage.removeItem("circuit-sprint-progress");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("circuit-sprint-progress", JSON.stringify({ completed, streak }));
  }, [completed, streak]);

  useEffect(() => {
    if (!timerRunning || secondsLeft === 0) return;
    const timeout = window.setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [timerRunning, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0) setTimerRunning(false);
  }, [secondsLeft]);

  const currentModule = modules.find((module) => module.id === activeModule) ?? modules[0];
  const quick = questions[quickQuestion];
  const minute = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const second = String(secondsLeft % 60).padStart(2, "0");
  const progress = Math.round((completed.length / modules.length) * 100);
  const mockQuestion = mockSet[mockIndex];
  const missionLabel = useMemo(() => `${completed.length} / ${modules.length} missions cleared`, [completed.length]);

  function markComplete(id: string) {
    setCompleted((items) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id]));
  }

  function answerQuick(answer: number) {
    if (quickAnswer !== null) return;
    setQuickAnswer(answer);
    setStreak((value) => (answer === quick.answer ? value + 1 : 0));
  }

  function nextQuick() {
    setQuickAnswer(null);
    setQuickQuestion((index) => (index + 1) % questions.length);
  }

  function toggleTimer() {
    if (secondsLeft === 0) {
      setSecondsLeft(8 * 60);
      setTimerRunning(true);
      return;
    }
    setTimerRunning((running) => !running);
  }

  function startMock() {
    setMockSet(shuffle(questions).slice(0, 15));
    setMockIndex(0);
    setMockAnswer(null);
    setMockScore(0);
    setMockDone(false);
  }

  function answerMock(answer: number) {
    if (mockAnswer !== null || !mockQuestion) return;
    setMockAnswer(answer);
    if (answer === mockQuestion.answer) setMockScore((score) => score + 1);
  }

  function nextMock() {
    if (mockIndex === mockSet.length - 1) {
      setMockDone(true);
      return;
    }
    setMockIndex((index) => index + 1);
    setMockAnswer(null);
  }

  return (
    <main>
      <section className="hero" id="top">
        <nav className="nav" aria-label="Main navigation">
          <a className="brand" href="#top"><span>◉</span> Circuit Sprint</a>
          <div className="nav-links">
            <a href="#missions">Missions</a>
            <a href="#drill">Drill</a>
            <a href="#mock">Mock test</a>
          </div>
        </nav>

        <div className="hero-grid">
          <div>
            <p className="eyebrow">LEVEL 1 ELECTRICAL DRAWINGS & PRINTS</p>
            <h1>Study like it&apos;s a game.<br /><em>Remember like it&apos;s test day.</em></h1>
            <p className="hero-copy">Eight short missions built from your learning tasks and self-tests. Pick one, clear a few questions, then stop before your brain turns it into homework.</p>
            <div className="hero-actions">
              <a className="button primary" href="#missions">Start an 8-minute mission <span>→</span></a>
              <a className="button ghost" href="#mock">Try the mock test</a>
            </div>
            <p className="microcopy">Designed for short focus bursts. Your progress stays on this device.</p>
          </div>
          <aside className="score-card" aria-label="Your study progress">
            <div className="score-top"><span>YOUR MAP</span><strong>{progress}%</strong></div>
            <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
            <p>{missionLabel}</p>
            <div className="score-grid">
              <div><b>{streak}</b><span>drill streak</span></div>
              <div><b>15</b><span>mock questions</span></div>
              <div><b>8m</b><span>best focus block</span></div>
            </div>
          </aside>
        </div>
      </section>

      <section className="focus-strip" aria-label="Focus sprint timer">
        <div>
          <p className="eyebrow">FOCUS SPRINT</p>
          <h2>{secondsLeft === 0 ? "Nice. Stand up and take a two-minute reset." : "One mission. Eight quiet minutes."}</h2>
        </div>
        <div className="timer" aria-live="polite">{minute}:{second}</div>
        <div className="timer-actions">
          <button className="button light" onClick={toggleTimer}>{timerRunning ? "Pause" : secondsLeft === 0 ? "Restart" : "Start"}</button>
          <button className="text-button" onClick={() => { setSecondsLeft(8 * 60); setTimerRunning(false); }}>Reset</button>
        </div>
      </section>

      <section className="section mission-section" id="missions">
        <div className="section-intro">
          <p className="eyebrow">MISSION MAP</p>
          <h2>Clear the course in chunks.</h2>
          <p>Open only one card. Read the three anchors. Answer the challenge out loud. Then mark it clear and move on.</p>
        </div>
        <div className="mission-grid">
          {modules.map((module, index) => {
            const isActive = module.id === activeModule;
            const isComplete = completed.includes(module.id);
            return (
              <button
                className={`mission ${isActive ? "active" : ""} ${isComplete ? "complete" : ""}`}
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                aria-pressed={isActive}
              >
                <span className="mission-number">0{index + 1}</span>
                <span className="mission-icon">{isComplete ? "✓" : module.icon}</span>
                <span className="mission-task">{module.task}</span>
                <strong>{module.title}</strong>
                <span className="mission-state">{isComplete ? "Cleared" : isActive ? "Open now" : "Tap to open"}</span>
              </button>
            );
          })}
        </div>

        <article className="lesson-card">
          <div className="lesson-heading">
            <span className="lesson-icon">{currentModule.icon}</span>
            <div><p className="eyebrow">{currentModule.task}</p><h3>{currentModule.title}</h3></div>
            <button className={`complete-toggle ${completed.includes(currentModule.id) ? "done" : ""}`} onClick={() => markComplete(currentModule.id)}>
              {completed.includes(currentModule.id) ? "✓ Mission cleared" : "Mark mission clear"}
            </button>
          </div>
          <p className="memory-hook">Memory hook: <strong>{currentModule.hook}</strong></p>
          <ul>{currentModule.points.map((point) => <li key={point}>{point}</li>)}</ul>
          <div className="speak-it"><span>🎤</span><div><b>Say-it-out-loud challenge</b><p>{currentModule.challenge}</p></div></div>
        </article>
      </section>

      <section className="section drill-section" id="drill">
        <div className="section-intro">
          <p className="eyebrow">QUICK-FIRE DRILL</p>
          <h2>One question. No doom-scrolling.</h2>
          <p>Answer first, then read why. Misses reset the streak - that is useful information, not a failure.</p>
        </div>
        <div className="drill-layout">
          <article className="question-card">
            <div className="question-meta"><span>{quick.topic}</span><span>STREAK {streak}</span></div>
            <h3>{quick.prompt}</h3>
            <div className="answer-list">
              {quick.options.map((option, index) => {
                const show = quickAnswer !== null;
                const state = show ? (index === quick.answer ? "correct" : index === quickAnswer ? "wrong" : "") : "";
                return <button className={`answer ${state}`} key={option} onClick={() => answerQuick(index)}><span>{String.fromCharCode(65 + index)}</span>{option}</button>;
              })}
            </div>
            {quickAnswer !== null && <div className={`feedback ${quickAnswer === quick.answer ? "yes" : "no"}`}><b>{quickAnswer === quick.answer ? "Correct - lock it in." : "Almost - repair that connection."}</b><p>{quick.why}</p><button className="text-button" onClick={nextQuick}>Next question →</button></div>}
          </article>
          <aside className="drill-aside">
            <div className="tip-card"><span>⚡</span><h3>How to use this</h3><p>Do 5 quick-fire questions after each mission. If you miss one twice, reopen that mission instead of grinding more questions.</p></div>
            <div className="tip-card yellow"><span>🧠</span><h3>Test-day trick</h3><p>Translate every prompt into a job-site question: “What am I trying to find, show, install, or count?”</p></div>
          </aside>
        </div>
      </section>

      <section className="section mock-section" id="mock">
        <div className="section-intro light-copy">
          <p className="eyebrow">END-OF-WEEK MOCK</p>
          <h2>Run a realistic mixed review.</h2>
          <p>Fifteen shuffled questions across all eight missions. Answer every one before checking the explanation.</p>
        </div>
        {!mockQuestion || mockDone ? (
          <div className="mock-start">
            {mockDone && <div className="result-badge"><span>{Math.round((mockScore / mockSet.length) * 100)}%</span><small>{mockScore} / {mockSet.length} correct</small></div>}
            <h3>{mockDone ? "Mock complete." : "Ready when you are."}</h3>
            <p>{mockDone ? "Review the explanation behind any question you missed in the quick-fire drill, then take another shuffled round tomorrow." : "Set aside 10-15 minutes, hide your notes, and play it straight."}</p>
            <button className="button primary" onClick={startMock}>{mockDone ? "Build another mock" : "Start 15-question mock"} <span>→</span></button>
          </div>
        ) : (
          <article className="mock-card">
            <div className="mock-progress"><span>QUESTION {mockIndex + 1} / {mockSet.length}</span><div><i style={{ width: `${((mockIndex + 1) / mockSet.length) * 100}%` }} /></div></div>
            <p className="question-topic">{mockQuestion.topic}</p>
            <h3>{mockQuestion.prompt}</h3>
            <div className="answer-list mock-answers">
              {mockQuestion.options.map((option, index) => {
                const show = mockAnswer !== null;
                const state = show ? (index === mockQuestion.answer ? "correct" : index === mockAnswer ? "wrong" : "") : "";
                return <button className={`answer ${state}`} key={option} onClick={() => answerMock(index)}><span>{String.fromCharCode(65 + index)}</span>{option}</button>;
              })}
            </div>
            {mockAnswer !== null && <div className="mock-feedback"><b>{mockAnswer === mockQuestion.answer ? "Correct." : "Review this one."}</b><p>{mockQuestion.why}</p><button className="button light" onClick={nextMock}>{mockIndex === mockSet.length - 1 ? "See results" : "Next question"} →</button></div>}
          </article>
        )}
      </section>

      <footer>
        <p><strong>Circuit Sprint</strong> · Built from your Level 1 learning tasks and self-tests.</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
