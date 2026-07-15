"use client";

import { useEffect, useMemo, useState } from "react";

type Insight = { term: string; explanation: string; use: string };
type Lesson = {
  id: string;
  number: string;
  source: string;
  title: string;
  overview: string;
  principle: string;
  insights: Insight[];
  check: { question: string; answer: string };
};

const lessons: Lesson[] = [
  {
    id: "drawing-types",
    number: "01",
    source: "Learning Tasks 1-4 · Unit 2 slides 6-7",
    title: "Know what a drawing is trying to tell you",
    overview: "Electrical drawings are not interchangeable. The first skill is identifying what kind of information a page is designed to communicate, so you do not hunt for cable routing on a schematic or circuit operation on a floor plan.",
    principle: "Schematic = operation. Wiring = physical connections. One-line = distribution. Block/riser = big-picture relationship.",
    insights: [
      { term: "Schematic", explanation: "Uses standardized symbols and straight connection lines to show the electrical relationship between components.", use: "Use it to trace how a circuit operates. It does not show physical locations or cable routes." },
      { term: "Wiring / connection", explanation: "Shows terminals, physical component layout, and actual wire connections. Wires are often colour-coded or numbered.", use: "Use it for installation and troubleshooting a real circuit." },
      { term: "One-line, block, and riser", explanation: "All simplify a system. A one-line can represent several conductors with one line; a block diagram shows major components; a riser shows equipment vertically through a building.", use: "Use them to understand power distribution, equipment relationships, and which floor equipment serves." },
    ],
    check: { question: "You need to understand why a door chime circuit behaves the way it does. Which drawing should you reach for first?", answer: "A schematic diagram. It makes the electrical relationship and current path easy to follow; convert to a wiring diagram when you need physical routing and terminals." },
  },
  {
    id: "symbols-lines",
    number: "02",
    source: "Learning Tasks 1-2 & 8 · Unit 2 slides 7-15, 22-32",
    title: "Read the visual language, not just the labels",
    overview: "Technical drawings use a controlled visual language. Symbols stand in for equipment, while line type tells you whether an edge is visible, hidden, centred, cut, or simply a reference.",
    principle: "Check the legend, then let line style and notation carry the meaning.",
    insights: [
      { term: "Symbols and legends", explanation: "The same device can appear differently on architectural, wiring, and schematic drawings. Symbols should be familiar, but every set may also have a legend.", use: "A legend wins over a guess. Symbol orientation generally does not change its meaning." },
      { term: "Line types", explanation: "Visible lines are heavy and continuous. Hidden lines are thin, equal dashes. Centre lines alternate long and short dashes. Section lines hatch a cut surface.", use: "Read line style before interpreting the shape around it." },
      { term: "Connections and notes", explanation: "A dot at a multiple junction means electrical connection; crossing lines without a dot are not automatically connected. Reference designations identify components, such as R1 for a resistor.", use: "Use notes and reference designations to remove ambiguity before installing or testing." },
    ],
    check: { question: "A thin broken line made of equal dashes appears inside the outline of a piece of equipment. What is it showing?", answer: "A hidden line. It identifies a feature that matters but is not visible from that view." },
  },
  {
    id: "views-scales",
    number: "03",
    source: "Learning Tasks 5, 7-8 · Unit 2 slides 16-21, 27, 33-39",
    title: "Move from a flat page to a real object",
    overview: "Pictorial drawings help you picture an object. Orthographic drawings help you build one. Scales and dimensions bridge the gap between the page and the site.",
    principle: "A drawing can be reduced or enlarged; the written dimension always refers to the real object.",
    insights: [
      { term: "Pictorial views", explanation: "Oblique, isometric, and perspective drawings show more than one surface in a single view. They are useful for a quick mental picture but distort some shapes.", use: "Use them to recognize the object, not as the best source for precise fabrication dimensions." },
      { term: "Orthographic views", explanation: "Plan means a top view; elevation means a side or vertical view. Sections expose internal construction. Front, top, and right-side views are common.", use: "Use these related two-dimensional views to build, locate, or coordinate equipment." },
      { term: "Scale and dimensions", explanation: "In 1:50, the object is 50 times larger than the drawing. In 2:1, the drawing is twice as large as the object. Dimensions are size, location, or notation dimensions.", use: "Use the stated scale only when dimensions are not provided and the drawing permits scaling." },
    ],
    check: { question: "A floor-plan dimension is labelled 3200, but the drawing is at 1:50. Is the real distance 64 000 mm?", answer: "No. The written dimension is already the real-world dimension: 3200 mm. Scale is for measuring an unlabelled distance from the page." },
  },
  {
    id: "drawing-set",
    number: "04",
    source: "Learning Tasks 9-12 · Unit 2 slides 40-52",
    title: "Navigate a drawing set like a working electrician",
    overview: "A drawing set is a coordinated set of answers, not a pile of pages. Start by locating the right sheet, then cross-reference its view, schedule, legend, notes, and related discipline drawings.",
    principle: "Index to locate. Title block to identify. Grid/reference to coordinate. Detail or section to resolve construction.",
    insights: [
      { term: "Working drawings", explanation: "Detail drawings provide the dimensions, views, and notes needed to construct an item. Assembly drawings show how parts fit together and use a parts list.", use: "Use the detail for fabrication information and the assembly view for sequence and relationship." },
      { term: "Index, title block, revisions", explanation: "The index page works like a table of contents. A title block is normally lower-right and identifies the sheet, project, author, date, and revision information.", use: "Use the revision box first when the work has changed; the latest revision is normally at the top." },
      { term: "Building views", explanation: "Site plans show the property and services. Floor plans show horizontal layout. Elevations show vertical faces. Details and sections show construction too small or hidden for plan/elevation views.", use: "Switch views instead of trying to force every answer out of a single page." },
    ],
    check: { question: "You know a feeder is shown on a floor plan but need to see how it continues between floors. What should you open next?", answer: "The associated riser or one-line diagram. It is designed to show distribution and vertical relationships more clearly than the floor plan." },
  },
  {
    id: "electrical-plans",
    number: "05",
    source: "Learning Tasks 11-13 · Unit 2 slides 43-52",
    title: "Find electrical information without guessing",
    overview: "The electrical plan tells you approximate device locations and systems. Exact placement, rating, circuiting, and installation details are often elsewhere in the set.",
    principle: "Site plan for service. Floor plan for layout. Schedule for tabulated equipment data. Riser for distribution.",
    insights: [
      { term: "Electrical site / plot plan", explanation: "Shows service entry, poles, manholes, pull pits, buried conduit/cable, equipment locations, and exterior lighting.", use: "Start here when the question is about how power reaches the property or building." },
      { term: "Electrical floor plans", explanation: "Show lighting, power, special systems, emergency lighting, and fire alarm layout. Larger projects may split these into lighting, power, and low-tension plans.", use: "Use the floor plan to locate equipment, then confirm details in schedules, notes, and diagrams." },
      { term: "Schedules, legends, and specifications", explanation: "Schedules organize equipment information in table form. Legends decode symbols. Specifications state required material, quality, and installation requirements.", use: "When a drawing and specification disagree, the specification is usually treated as correct." },
    ],
    check: { question: "Where would you look first to locate incoming electrical service and underground conduit on a property?", answer: "The electrical site/plot plan. It is the drawing intended to show utilities, service entry, and exterior electrical work." },
  },
  {
    id: "manuals",
    number: "06",
    source: "Learning Tasks 14-15",
    title: "Use manuals as a working tool",
    overview: "A manual is not background reading. It is the manufacturer’s organized source for safe installation, setup, operation, maintenance, and troubleshooting of a particular model.",
    principle: "Confirm the model. Read safety. Use the section that matches the job stage.",
    insights: [
      { term: "Safety and model information", explanation: "Manuals commonly flag hazards with WARNING, CAUTION, and DANGER. One manual can cover several models with different ratings or requirements.", use: "Verify the exact model and its rating before you install it, even if the equipment seems familiar." },
      { term: "Installation instructions", explanation: "Focus on assembly, dimensions, rough-in locations, conduits, wires, handling, and the step-by-step installation sequence.", use: "This is the section to consult during the construction and rough-in phase." },
      { term: "Equipment manuals", explanation: "Often cover safety, assembly, installation, programming, operation, maintenance, troubleshooting, warranty, and contacts.", use: "Use them when the work extends beyond installation into commissioning, user setup, or service." },
    ],
    check: { question: "A device is connected but has a delay before it begins operating. Which manual section should you check before troubleshooting?", answer: "Operation. It explains normal behaviour and settings, helping you tell a designed delay from a fault." },
  },
  {
    id: "takeoff",
    number: "07",
    source: "Learning Task 16",
    title: "Turn drawings into a material plan",
    overview: "A material takeoff is a systematic count of every system and every item needed to complete it. The goal is not just a longer list; it is an accurate, buildable plan with fewer missed parts and fewer site trips.",
    principle: "Read the full set. Count by system. Separate rough-in from finish. Verify against code and site reality.",
    insights: [
      { term: "Systematic takeoff", explanation: "Review the entire electrical set, then count panels, breakers, cable/conduit, boxes, devices, lighting, communication, emergency, and mechanical-system materials separately.", use: "A count is more reliable when every system has its own pass through the drawings." },
      { term: "Rough-in versus finish", explanation: "Rough-in includes drilled paths, cable/conduit, boxes, splices, and supports. Finish work includes devices, plates, fixtures, and final connections.", use: "Separate lists help get the right material delivered at the right stage." },
      { term: "Code and field check", explanation: "The Canadian Electrical Code governs box fill, conductor and breaker size, device suitability, and installation requirements. Plans do not replace judgment.", use: "Verify the plan against actual measurements, conditions, and applicable code before committing materials." },
    ],
    check: { question: "Why can’t you simply count receptacle symbols and order material from that number alone?", answer: "A complete takeoff also needs boxes, conductors, cable/conduit length, connectors, supports, breakers, plates, and code-driven details. The full installation must be accounted for." },
  },
];

const drawingSet = [
  ["Site / plot plan", "Property limits, north arrow, utilities, service connection points, outdoor work, and contour/elevation information."],
  ["Floor plan", "Horizontal layout: rooms, walls, devices, lighting, equipment, and trade-specific systems."],
  ["Elevation", "Vertical face or side view used for walls, equipment, cabinets, and exterior/interior faces."],
  ["Detail / section", "Large-scale or cut-away view revealing construction that is too small or hidden on a plan."],
  ["Legend / schedule", "Symbol definitions and organized equipment or circuit information in a table."],
  ["Riser / one-line", "Simplified distribution path through equipment and between building levels."],
];

export default function Home() {
  const [activeLesson, setActiveLesson] = useState(lessons[0].id);
  const [complete, setComplete] = useState<string[]>([]);
  const [answerShown, setAnswerShown] = useState(false);
  const [drawingSetSelection, setDrawingSetSelection] = useState(0);
  const [scale, setScale] = useState("50");
  const [paperDistance, setPaperDistance] = useState("64");

  useEffect(() => {
    const saved = window.localStorage.getItem("electrical-drawings-study-progress");
    if (saved) setComplete(JSON.parse(saved) as string[]);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("electrical-drawings-study-progress", JSON.stringify(complete));
  }, [complete]);

  const lesson = lessons.find((item) => item.id === activeLesson) ?? lessons[0];
  const realDistance = useMemo(() => {
    const multiplier = Number(scale);
    const measured = Number(paperDistance);
    return Number.isFinite(multiplier) && Number.isFinite(measured) ? measured * multiplier : 0;
  }, [scale, paperDistance]);

  function selectLesson(id: string) {
    setActiveLesson(id);
    setAnswerShown(false);
  }

  function toggleComplete(id: string) {
    setComplete((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  }

  return (
    <main>
      <header className="hero" id="top">
        <nav className="nav" aria-label="Main navigation">
          <a href="#top" className="wordmark">ELECTRICAL WIRING <span>UNIT 2</span></a>
          <div className="nav-links"><a href="#learn">Learn</a><a href="#reference">Reference</a><a href="#review">Review</a></div>
        </nav>
        <div className="hero-content">
          <p className="kicker">DRAWINGS · SPECIFICATIONS · MATERIAL TAKEOFFS</p>
          <h1>Understand the print<br />before you <em>build from it.</em></h1>
          <p>This study guide turns your learning tasks, self-tests, and Unit 2 presentation into short explanations you can work through without reading a textbook for hours.</p>
          <div className="hero-meta"><span>Learning Tasks 1-16</span><span>Unit 2 presentation</span><span>Your progress saves here</span></div>
          <a className="primary-link" href="#learn">Begin with drawing types <b>↓</b></a>
        </div>
      </header>

      <section className="how-to" aria-label="How to study with this guide">
        <span>01 <b>Read the short explanation</b></span><i />
        <span>02 <b>Use the visual reference</b></span><i />
        <span>03 <b>Reveal the answer only after thinking</b></span>
      </section>

      <section className="learn" id="learn">
        <aside className="study-nav">
          <div className="study-nav-head"><p className="kicker">STUDY PATH</p><strong>{complete.length} of {lessons.length} reviewed</strong></div>
          {lessons.map((item) => <button key={item.id} onClick={() => selectLesson(item.id)} className={item.id === lesson.id ? "selected" : ""}><span>{complete.includes(item.id) ? "✓" : item.number}</span><div><b>{item.title}</b><small>{item.source}</small></div></button>)}
        </aside>
        <article className="lesson">
          <p className="lesson-source">{lesson.source}</p>
          <h2>{lesson.title}</h2>
          <p className="overview">{lesson.overview}</p>
          <div className="principle"><span>Core idea</span><strong>{lesson.principle}</strong></div>
          <div className="insights">
            {lesson.insights.map((insight, index) => <section key={insight.term}><span>0{index + 1}</span><h3>{insight.term}</h3><p>{insight.explanation}</p><div><b>On the job:</b> {insight.use}</div></section>)}
          </div>
          <div className="lesson-footer">
            <button onClick={() => toggleComplete(lesson.id)} className={complete.includes(lesson.id) ? "reviewed" : ""}>{complete.includes(lesson.id) ? "Reviewed" : "Mark as reviewed"}</button>
            <span>Move on only when you could explain the core idea in your own words.</span>
          </div>
        </article>
      </section>

      <section className="reference" id="reference">
        <div className="section-heading"><p className="kicker">REFERENCE LAB</p><h2>Make the page mean something.</h2><p>Use these when a concept feels abstract. They are teaching aids, not another test.</p></div>
        <div className="reference-grid">
          <article className="line-lab">
            <p className="lab-label">LINE TYPE REFERENCE</p>
            <h3>Read what the line is telling you.</h3>
            <div className="line-samples">
              <div><i className="visible-line" /><b>Visible</b><span>edge you can see</span></div>
              <div><i className="hidden-line" /><b>Hidden</b><span>feature behind view</span></div>
              <div><i className="centre-line" /><b>Centre</b><span>axis of arc or circle</span></div>
              <div><i className="section-line" /><b>Section</b><span>cut surface</span></div>
            </div>
          </article>
          <article className="scale-lab">
            <p className="lab-label">SCALE CHECK</p>
            <h3>Translate page distance to site distance.</h3>
            <p>Enter a drawing measurement and its scale. This is only for an unlabelled distance when the drawing allows scaling.</p>
            <div className="scale-inputs"><label>On drawing <input type="number" min="0" value={paperDistance} onChange={(event) => setPaperDistance(event.target.value)} /><small>mm</small></label><label>Scale 1:<input type="number" min="1" value={scale} onChange={(event) => setScale(event.target.value)} /></label></div>
            <div className="scale-result">Estimated real distance <strong>{realDistance.toLocaleString()} mm</strong><span>({(realDistance / 1000).toFixed(2)} m)</span></div>
          </article>
        </div>
        <article className="drawing-set-lab">
          <div><p className="lab-label">DRAWING SET NAVIGATOR</p><h3>Choose the view that can answer your question.</h3><p>One sheet rarely contains the whole answer. Select a drawing type to see what it is meant to resolve.</p></div>
          <div className="drawing-set-options">{drawingSet.map(([name], index) => <button key={name} onClick={() => setDrawingSetSelection(index)} className={drawingSetSelection === index ? "selected" : ""}>{name}</button>)}</div>
          <div className="drawing-set-result"><span>{String(drawingSetSelection + 1).padStart(2, "0")}</span><div><b>{drawingSet[drawingSetSelection][0]}</b><p>{drawingSet[drawingSetSelection][1]}</p></div></div>
        </article>
      </section>

      <section className="review" id="review">
        <div className="review-copy"><p className="kicker">LOW-PRESSURE REVIEW</p><h2>Think first. Then reveal the teaching answer.</h2><p>These are not scored. They are prompts to check whether the explanation stuck. If it did not, go back to the relevant lesson rather than guessing through a bank of questions.</p></div>
        <article className="review-card">
          <p>CHECK YOUR UNDERSTANDING</p>
          <h3>{lesson.check.question}</h3>
          {!answerShown ? <button onClick={() => setAnswerShown(true)}>Reveal the explanation</button> : <div className="revealed-answer"><b>Teaching answer</b><p>{lesson.check.answer}</p><button onClick={() => setAnswerShown(false)}>Hide answer</button></div>}
        </article>
      </section>

      <footer><strong>Electrical Wiring Unit 2</strong><span>Drawings and Specifications · Study guide based on the supplied learning tasks, self-tests, and Unit 2 presentation.</span><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
