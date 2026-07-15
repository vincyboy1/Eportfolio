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

type CoachCard = { label: string; prompt: string; answer: string; note?: string; status?: "source" | "visual" };
type CoachSet = { title: string; task: string; cards: CoachCard[] };

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

type SourceTask = { id: string; number: string; title: string; pages: number; padded?: boolean; study: string; highlights: string[] };

const sourceTasks: SourceTask[] = [
  { id: "lt-01", number: "01", title: "Identify symbols", pages: 4, study: "Start with the legend. Learn the common architectural, wiring, and schematic symbols by comparing the same device in each drawing language.", highlights: ["Architectural vs wiring vs schematic symbols", "CSA electrical floor-plan symbols", "Symbol charts for devices, controls, and components"] },
  { id: "lt-02", number: "02", title: "Schematic diagram conventions", pages: 5, study: "Schematics explain operation. Read from source to load, follow straight horizontal/vertical lines, and use dots to distinguish an electrical junction from a crossover.", highlights: ["Mechanical pencil, line weight, and dashed linkage", "Left-to-right / top-to-bottom circuit flow", "Reference designations and de-energized contacts"] },
  { id: "lt-03", number: "03", title: "Wiring diagram conventions", pages: 6, study: "A wiring or connection diagram shows the real terminals, physical layout, wire paths, numbers, and colours. It is for making or tracing actual connections.", highlights: ["Pictorial, schematic, and wiring views of one circuit", "Point-to-point vs highway / trunk-line wiring", "Terminal, polarity, wire-number, and colour conventions"] },
  { id: "lt-04", number: "04", title: "Single-line, block, and riser diagrams", pages: 5, study: "One-line drawings simplify distribution: one line can stand for several conductors and normally omits the return path. Riser drawings add the building's vertical relationship.", highlights: ["Power distribution through 2D1 and 2D2", "Block diagrams and equipment relationships", "Riser diagram reading"] },
  { id: "lt-05", number: "05", title: "Use diagrams to convey information", pages: 2, study: "Pictorial drawings make an object easier to visualize. Compare oblique, isometric, and perspective views, then choose the one that best communicates the needed shape and detail.", highlights: ["Pictorial drawing purpose", "Oblique, isometric, and perspective representation", "How visual views differ from fabrication views"] },
  { id: "lt-06", number: "06", title: "Convert schematic and wiring diagrams", pages: 4, study: "Translate circuit operation into physical connections. Trace the two-location lamp circuit, then check how every connection is represented on the wiring diagram.", highlights: ["Two 120 V lamps controlled from two locations", "Reading a circuit before drawing it", "Converting schematic logic into wiring"] },
  { id: "lt-07", number: "07", title: "Orthographic projection", pages: 4, study: "Use plan, front, and side views together. Think of an object in a glass box: each face gives one straight-on view without perspective distortion.", highlights: ["Glass-box projection model", "Plan, front, and right-side views", "How related dimensions transfer between views"] },
  { id: "lt-08", number: "08", title: "Lines, lettering, and dimensioning", pages: 6, study: "Technical drawings rely on conventions. Identify visible, hidden, centre, section, dimension, extension, and leader lines before interpreting the object around them.", highlights: ["Line types and what each communicates", "Uppercase lettering and clear notes", "Dimension, extension, leader, and notation conventions"] },
  { id: "lt-09", number: "09", title: "Working drawings", pages: 3, study: "Working drawings give the information needed to make or construct something. Detail drawings provide dimensions and notes; assembly drawings show how identified parts fit together.", highlights: ["Working detail drawing: dimensions, views, notes", "Working assembly drawing: parts list and fit", "Detail-assembly drawings combine both needs"] },
  { id: "lt-10", number: "10", title: "Construction drawings and their divisions", pages: 17, padded: true, study: "A construction set is coordinated information. Learn which view answers site, layout, exterior, hidden construction, detailed, manufacturing, and final-record questions.", highlights: ["Site, plan, elevation, section, and detail drawings", "Title blocks, references, and drawing-set coordination", "Shop drawings and as-built drawings"] },
];

const selfTest9Pages = [
  "Questions 1-5: service entry, 2D1/2D2, elevator feeder, meter centre.",
  "Questions 6-8: symbols, conduit route, wall type.",
  "Questions 9-13: architectural information and Typical Suite E panel.",
  "Questions 14-18: Typical Suite E circuits, devices, and lighting.",
  "Questions 19-23: communication conduit, fire alarm, and site-plan service facts.",
  "Questions 24-27: E1 site plan and E12 riser lookups.",
  "Questions 28-30: E12 fire alarm riser and E13 suite distribution.",
  "Question 30 continued: suite layouts and kitchen circuits.",
  "Question 31: E10 third-floor emergency and fire-alarm plan.",
  "Question 31 continued and answer-key direction.",
];

const coachSets: CoachSet[] = [
  {
    title: "Self-Test 1 · Diagram types and symbols",
    task: "Learning Tasks 1-4",
    cards: [
      { label: "Questions 1-8", prompt: "Separate the diagram types before answering the first group.", answer: "The three major electrical diagram types are single-line, schematic, and wiring. Single-line diagrams include block and riser diagrams. A block diagram shows major components; a power riser shows distribution and equipment vertically through a building. A schematic explains operation; a wiring diagram shows how to wire the circuit. The statement that wiring diagrams are simpler than schematics is false." },
      { label: "Questions 9-12", prompt: "Identify the symbols shown in the figures.", answer: "Use the symbol pages in Learning Task 1 and the Unit 2 symbol slides: a battery cell is a long and short parallel line. For the CSA, architectural, wiring, and schematic symbols, match the exact line/circle arrangement to the legend instead of relying on a label alone.", note: "These questions use image-only figures. The supplied PDFs do not include an answer key naming every figure, so use the symbol reference while practising.", status: "visual" },
      { label: "Questions 13-20", prompt: "Recall the drawing conventions behind the final group.", answer: "A mechanical pencil is preferred for consistent-width lines and no sharpening. Dashed lines show mechanical linkage; heavier lines add emphasis, such as power versus control. Templates make clean standard shapes and symbols. A dot at a multiple junction means electrical connection. A ground symbol can mean a common chassis point. A reference designation uses letters/numbers to identify a component, for example R1. Another name for a wiring diagram is a connection diagram. The two common wiring types are point-to-point and highway/trunk-line." },
    ],
  },
  {
    title: "Self-Test 2 · Converting diagrams",
    task: "Learning Task 6",
    cards: [
      { label: "Questions 1-3", prompt: "How do you turn a wiring diagram into a readable schematic?", answer: "Use schematic conventions: put the power source at the top, arrange components left-to-right, use reference designations, keep paths clear, and draw contacts de-energized. Number each wire path from the source through components and back to the source; colour or wire numbers are the preferred identifiers. The final question is a drawing exercise, so practise by tracing one loop at a time rather than trying to redraw the whole circuit at once." },
    ],
  },
  {
    title: "Self-Tests 3-5 · Views, lines, and working drawings",
    task: "Learning Tasks 5, 7-9",
    cards: [
      { label: "Self-Test 3 · Questions 1-10", prompt: "How do pictorial and orthographic views differ?", answer: "Pictorial drawings give a quick mental image; the three main types are oblique, isometric, and perspective. Orthographic projections show true two-dimensional views and are used for precise fabrication. A standard projection has six possible views, but front, top, and right-side are most common. Orthographic drawings are drawn to scale and still include dimensions. For an electrician, their common use is detail and assembly drawings.", note: "Question 3 asks which image is isometric. Use the image rule: an isometric base is angled about 30 degrees to horizontal and all three surfaces are slightly distorted.", status: "visual" },
      { label: "Self-Test 4 · Questions 1-4", prompt: "What line, lettering, scale, and dimension rules should you remember?", answer: "Visible = heavy continuous; hidden = thin equal dashes; centre = alternating long/short dashes; section = thin 45-degree hatching; long break = a removed portion of a long view. In 1:10, 1 refers to the drawing and 10 to the actual object. Use clear vertical capital lettering. The three dimension types are size, location, and notation." },
      { label: "Self-Test 5 · Questions 1-3", prompt: "Define the core working-drawing terms.", answer: "A working drawing is the information needed to manufacture or construct an object or structure. A detail drawing gives dimensions, views, and notes for one item. An assembly drawing shows how parts fit together and identifies them in an adjacent parts list; it is not the primary source for construction dimensions." },
    ],
  },
  {
    title: "Self-Test 6 · Construction drawings",
    task: "Learning Task 10",
    cards: [
      { label: "Questions 1-7", prompt: "What is the purpose and organization of construction drawings?", answer: "Their purpose is to convey how something is built or installed, including design intent, location, dimensions, materials, and coordination. A blueprint is a reproduction of a master drawing. A division contains working drawings such as site/plot plan, plan, elevation, section, and detail. Electrical site information is not identical to architectural site information. CAD creates the master; a pen plotter historically produced it. Engineers prepare subtrade drawings; estimators price labour/material; construction workers build; maintenance workers use as-builts later." },
      { label: "Questions 8-14", prompt: "Match common drawing names to their job.", answer: "The five working drawings are site/plot plan, plan, elevation, section, and detail. Elevation = a face of a building; detail = enlarged small component; site plan = top view of property; section = inside below a cut surface; as-built = record of deviations; shop drawing = manufacturer equipment detail; floor plan = top view inside. The electrical floor plan is the most frequently used electrical drawing. A section cut is referenced on a floor plan or elevation. Shop drawings are prepared by the manufacturer." },
    ],
  },
  {
    title: "Self-Tests 7-8 · Print navigation and electrical plans",
    task: "Learning Tasks 11-12",
    cards: [
      { label: "Self-Test 7 · Questions 1-14", prompt: "How do you navigate and decode a set of prints?", answer: "The index page is the table of contents. E3 means the third electrical drawing. The title block contains the consulting engineer and project information; the revision box identifies the latest changes. Scaling means measuring a drawing and converting by its stated scale, only when permitted. Grid lines are evenly spaced across drawings; bay lines tie to actual structural features and may be irregular. A hidden line is thin with equal dashes; a long break line shows part of a view removed. A legend explains symbols. General notes apply broadly; special notes apply to a particular location. A schedule presents drawing notes or equipment data in a table." },
      { label: "Self-Test 7 · Questions 15-17", prompt: "Read the panelboard and lighting plan in Figure 3.", answer: "These require the actual Figure 3 plan and schedules. Trace the circuit label from the device to the panelboard, then confirm its circuit number in the panel schedule. Do not invent a panel or circuit number from the text alone.", note: "The source figure is in the self-test, but its small labels were not reliable enough to turn into a trustworthy answer key.", status: "source" },
      { label: "Self-Test 7 · Questions 18-22", prompt: "What are specifications and why do they matter?", answer: "A specification is the written requirement for material, quality, and work. If it conflicts with a drawing, the specification is usually correct. This course uses the older standard format of 16 major divisions, sequenced numerically by division. Consistent order lets every trade find requirements quickly and reduces confusion. Common electrical schedules include panelboard, lighting-fixture, and equipment schedules." },
      { label: "Self-Test 8 · Questions 1-5", prompt: "What are the main electrical working drawings?", answer: "The usual five are electrical site/plot plan, electrical floor plan, elevation, section, and detail. Use the site plan for service entry. Multi-storey buildings generally have at least one floor plan for each floor. A floor plan looks down at the building; a reflected ceiling plan looks up at ceiling features as if reflected in a mirror. Electrical sections clarify concealed routes, vertical relationships, equipment mounting, and construction conditions." },
    ],
  },
  {
    title: "Self-Test 9 · Cloverdale plans",
    task: "Learning Task 13",
    cards: [
      { label: "Questions 1-31", prompt: "Open the original Self-Test 9 pages above, then use the named drawing sheet for each answer.", answer: "These are direct plan lookups. For Question 1, find the incoming service on sheet E1, orient yourself using the north arrow, then state the direction from which it enters the site. E1 is also used for the site/service questions; E12 for risers and fire alarm; E13 for suites; and E10 for the third-floor emergency/fire-alarm questions. The answer comes from the printed drawing, not from guessing.", note: "The uploaded ZIPs include the questions but not the Cloverdale E1, E10, E12, or E13 sheets. The site now includes every supplied question page and identifies exactly which missing sheet each group needs.", status: "source" },
    ],
  },
  {
    title: "Self-Test 10 · Manuals and instructions",
    task: "Learning Task 14",
    cards: [
      { label: "Questions 1-9", prompt: "Use the manual section that matches the task.", answer: "The manufacturer decides manual content. Safety instructions protect the installer, end user, and equipment. Use Installation for rough-in conduit and wire placement. Use Models/ratings to check load capability. Use Operation to find normal start-up behaviour or delays. Use Maintenance to keep equipment in condition. Common safety signal words are WARNING, CAUTION, and DANGER. Read even familiar equipment instructions because models, ratings, procedures, and hazards can change. Programmable equipment commonly includes controls such as occupancy sensors, timers, and other electronic controllers." },
    ],
  },
  {
    title: "Self-Test 11 · Manual lookup practice",
    task: "Learning Task 15",
    cards: [
      { label: "Questions 1-28", prompt: "Locate exact Ideal Megger, Siemens Power Mod, and Intermatic values.", answer: "Start with the model/scope page, then use the table of contents and section headings: safety and operation for the Megger; installation drawings, dimensions, torque, phasing, and grounding for Power Mod; ratings, installation, adjustment, and troubleshooting for the occupancy sensor. Record the exact page or figure beside each answer.", note: "The three manufacturer manuals from the Learning Guide appendix were not included in the uploaded files. Exact warranty periods, torque values, settings, and model dimensions cannot be safely guessed.", status: "source" },
    ],
  },
  {
    title: "Self-Test 12 · PPE and material takeoff",
    task: "Learning Task 16",
    cards: [
      { label: "Questions 1-3", prompt: "Recognize PPE and common electrical symbols.", answer: "Examples of PPE include safety glasses, appropriate gloves, a hard hat, safety footwear, hearing protection, and protective clothing as the task requires. For the image-based PPE and symbol questions, use the Learning Task 16 figures together with the Unit 2 symbol reference: identify the safety purpose first, then match the exact graphic to the legend.", note: "The exact figure labels are visual, so practise matching them rather than memorizing a text-only list.", status: "visual" },
      { label: "Question 4", prompt: "Build a rough-in, finish, and tool list from the drawing.", answer: "Make separate passes: count each device and fixture; identify boxes, cable/conduit, connectors, supports, breakers, and panels for rough-in; then devices, plates, and fixtures for finish. Add the required hand/power tools. Confirm the Canadian Electrical Code requirements for box fill, conductor/breaker size, and location-specific devices. The goal is a complete buildable installation, not just a count of symbols." },
    ],
  },
];

export default function Home() {
  const [activeLesson, setActiveLesson] = useState(lessons[0].id);
  const [complete, setComplete] = useState<string[]>([]);
  const [answerShown, setAnswerShown] = useState(false);
  const [drawingSetSelection, setDrawingSetSelection] = useState(0);
  const [scale, setScale] = useState("50");
  const [paperDistance, setPaperDistance] = useState("64");
  const [coachIndex, setCoachIndex] = useState(0);
  const [revealedCards, setRevealedCards] = useState<string[]>([]);
  const [sourceTaskIndex, setSourceTaskIndex] = useState(0);
  const [sourcePage, setSourcePage] = useState(1);
  const [selfTest9Page, setSelfTest9Page] = useState(1);

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
  const selectedSourceTask = sourceTasks[sourceTaskIndex];
  const sourcePageFile = `page-${selectedSourceTask.padded ? String(sourcePage).padStart(2, "0") : sourcePage}.jpg`;

  function selectLesson(id: string) {
    setActiveLesson(id);
    setAnswerShown(false);
  }

  function toggleComplete(id: string) {
    setComplete((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  }

  function toggleCoachCard(id: string) {
    setRevealedCards((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  }

  function selectSourceTask(index: number) {
    setSourceTaskIndex(index);
    setSourcePage(1);
  }

  return (
    <main>
      <header className="hero" id="top">
        <nav className="nav" aria-label="Main navigation">
          <a href="#top" className="wordmark">ELECTRICAL WIRING <span>UNIT 2</span></a>
          <div className="nav-links"><a href="#learn">Learn</a><a href="#course-pages">Course pages</a><a href="#self-test">Self-test coach</a></div>
        </nav>
        <div className="hero-content">
          <p className="kicker">DRAWINGS · SPECIFICATIONS · MATERIAL TAKEOFFS</p>
          <h1>Understand the print<br />before you <em>build from it.</em></h1>
          <p>This study guide turns your learning tasks, self-tests, and Unit 2 presentation into short explanations you can work through without reading a textbook for hours.</p>
          <div className="hero-meta"><span>Learning Tasks 1-16</span><span>Unit 2 presentation</span><span>Your progress saves here</span></div>
          <a className="primary-link" href="#course-pages">Open the actual course pages <b>↓</b></a>
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

      <section className="course-pages" id="course-pages">
        <div className="course-pages-heading"><p className="kicker">COURSE WALKTHROUGH · LT 1–10</p><h2>Your actual learning tasks, built into the site.</h2><p>These are the original course pages from your files—not recreated diagrams. Use the short study brief to orient yourself, then work through every page at your own pace.</p></div>
        <div className="source-layout">
          <aside className="source-task-list" aria-label="Learning task selector">
            {sourceTasks.map((task, index) => <button key={task.id} onClick={() => selectSourceTask(index)} className={sourceTaskIndex === index ? "selected" : ""}><span>{task.number}</span><div><b>{task.title}</b><small>{task.pages} original pages</small></div></button>)}
          </aside>
          <article className="source-reader">
            <p className="course-task-label">LEARNING TASK {selectedSourceTask.number}</p>
            <h3>{selectedSourceTask.title}</h3>
            <p className="source-study">{selectedSourceTask.study}</p>
            <div className="source-highlights"><b>What you should leave knowing</b>{selectedSourceTask.highlights.map((item) => <span key={item}>{item}</span>)}</div>
            <div className="page-toolbar"><button onClick={() => setSourcePage((page) => Math.max(1, page - 1))} disabled={sourcePage === 1}>Previous page</button><strong>Original page {sourcePage} of {selectedSourceTask.pages}</strong><button onClick={() => setSourcePage((page) => Math.min(selectedSourceTask.pages, page + 1))} disabled={sourcePage === selectedSourceTask.pages}>Next page</button></div>
            <figure className="source-page"><img src={`course-source/${selectedSourceTask.id}/${sourcePageFile}`} alt={`Original Learning Task ${selectedSourceTask.number}, page ${sourcePage}`} /><figcaption>Original course page · Learning Task {selectedSourceTask.number} · page {sourcePage}</figcaption></figure>
          </article>
        </div>
      </section>

      <section className="self-test-nine" id="self-test-nine">
        <div className="self-test-nine-copy"><p className="kicker">SELF-TEST 9 · ORIGINAL PAGES</p><h2>Use the real questions—not a made-up substitute.</h2><p>Self-Test 9 is included below, page for page. Question 1 is a factual lookup on the Cloverdale drawing, so you were right to call out the earlier answer.</p><div className="source-reality"><b>Important source check</b><p>The course itself labels this as <strong>Learning Task 13</strong>, not Learning Task 9. It directs you to Cloverdale sheets E1, E10, E12, and E13 at the back of the Learning Guide. Those sheets are not present in either ZIP you uploaded, so no honest site can supply their exact answers yet. Learning Task 9 is still included above because it teaches working drawings, but it is not the source for these Cloverdale facts.</p></div><p className="self-test-route"><b>Question route:</b> pages 1–5 use service, plan, and suite information; pages 6–7 name E1/E12; pages 7–8 name E12/E13; pages 9–10 name E10.</p></div>
        <article className="self-test-reader"><div className="page-toolbar"><button onClick={() => setSelfTest9Page((page) => Math.max(1, page - 1))} disabled={selfTest9Page === 1}>Previous page</button><strong>Self-Test 9 · page {selfTest9Page} of 10</strong><button onClick={() => setSelfTest9Page((page) => Math.min(10, page + 1))} disabled={selfTest9Page === 10}>Next page</button></div><figure className="source-page"><img src={`course-source/self-test-09/page-${String(selfTest9Page).padStart(2, "0")}.jpg`} alt={`Original Self-Test 9, page ${selfTest9Page}`} /><figcaption>{selfTest9Pages[selfTest9Page - 1]}</figcaption></figure></article>
      </section>

      <section className="self-test" id="self-test">
        <div className="self-test-intro"><p className="kicker">SELF-TEST COACH</p><h2>Study the answer before you ask yourself to recall it.</h2><p>Every group below maps to your supplied self-tests. “Visual practice” means you need to match a figure to the legend. “Source required” means the exact plan sheet or manufacturer manual was not in the uploaded course files, so the site tells you exactly where to look instead of making up an answer.</p></div>
        <div className="coach-layout">
          <div className="coach-tabs">{coachSets.map((set, index) => <button key={set.title} onClick={() => setCoachIndex(index)} className={coachIndex === index ? "selected" : ""}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{set.title}</b><small>{set.task}</small></div></button>)}</div>
          <article className="coach-content">
            <p className="coach-task">{coachSets[coachIndex].task}</p><h3>{coachSets[coachIndex].title}</h3>
            <p className="coach-instruction">Read the prompt. Pause long enough to form an answer. Then reveal the teaching answer and compare your thinking.</p>
            <div className="coach-cards">{coachSets[coachIndex].cards.map((card, index) => {
              const id = `${coachIndex}-${index}`; const shown = revealedCards.includes(id);
              return <section className={`coach-card ${card.status ?? ""}`} key={id}><div className="coach-label"><span>{card.label}</span>{card.status === "visual" && <em>Visual practice</em>}{card.status === "source" && <em>Source required</em>}</div><h4>{card.prompt}</h4>{shown ? <div className="coach-answer"><b>{card.status === "source" ? "How to locate it" : "Teaching answer"}</b><p>{card.answer}</p>{card.note && <aside>{card.note}</aside>}<button onClick={() => toggleCoachCard(id)}>Hide answer</button></div> : <button className="reveal" onClick={() => toggleCoachCard(id)}>Reveal explanation</button>}</section>;
            })}</div>
          </article>
        </div>
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
