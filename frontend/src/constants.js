// ─────────────────────────────────────────────────────────────────────────────
// Universal AI Tutor — constants.js
// Supports ANY subject a student anywhere in the world wants to learn.
// Core subjects have 50 pre-built questions (5 per grade × 10 grades).
// Custom subjects typed by the student are handled dynamically by the AI.
// ─────────────────────────────────────────────────────────────────────────────

export const GRADES = [
  "Grade 1","Grade 2","Grade 3","Grade 4","Grade 5",
  "Grade 6","Grade 7","Grade 8","Grade 9","Grade 10",
  "Grade 11","Grade 12",
];

// Age → suggested grade mapping (used when student enters age)
export function ageToGrade(age) {
  const n = parseInt(age);
  if (isNaN(n)) return "Grade 6";
  if (n <= 6)  return "Grade 1";
  if (n === 7)  return "Grade 2";
  if (n === 8)  return "Grade 3";
  if (n === 9)  return "Grade 4";
  if (n === 10) return "Grade 5";
  if (n === 11) return "Grade 6";
  if (n === 12) return "Grade 7";
  if (n === 13) return "Grade 8";
  if (n === 14) return "Grade 9";
  if (n === 15) return "Grade 10";
  if (n === 16) return "Grade 11";
  return "Grade 12";
}

// ─── Core subject registry ────────────────────────────────────────────────────
// Each subject has: label, color, gradient, icon (SVG path data), description
export const SUBJECTS = {
  mathematics: {
    label: "Mathematics",
    color: "#399aff",
    gradient: "linear-gradient(135deg, #1a7de8, #399aff)",
    description: "Numbers, algebra, geometry & calculus",
  },
  science: {
    label: "Science",
    color: "#399aff",
    gradient: "linear-gradient(135deg, #1a7de8, #399aff)",
    description: "Physics, chemistry, biology & earth science",
  },
  english: {
    label: "English",
    color: "#399aff",
    gradient: "linear-gradient(135deg, #1a7de8, #399aff)",
    description: "Grammar, literature, writing & comprehension",
  },
  history: {
    label: "History",
    color: "#399aff",
    gradient: "linear-gradient(135deg, #1a7de8, #399aff)",
    description: "World history, civics & geography",
  },
  cs: {
    label: "Computer Science",
    color: "#399aff",
    gradient: "linear-gradient(135deg, #1a7de8, #399aff)",
    description: "Coding, algorithms, data structures & AI",
  },
  ai: {
    label: "AI & Machine Learning",
    color: "#399aff",
    gradient: "linear-gradient(135deg, #1a7de8, #399aff)",
    description: "Neural networks, ML models & AI ethics",
  },
  webdev: {
    label: "Web Development",
    color: "#399aff",
    gradient: "linear-gradient(135deg, #1a7de8, #399aff)",
    description: "HTML, CSS, JavaScript & React",
  },
  blocks: {
    label: "Block Coding",
    color: "#399aff",
    gradient: "linear-gradient(135deg, #1a7de8, #399aff)",
    description: "Scratch, Python & visual programming",
  },
  custom: {
    label: "Other Subject",
    color: "#399aff",
    gradient: "linear-gradient(135deg, #1a7de8, #399aff)",
    description: "Any subject you want to learn",
  },
};

// ─── 50 questions per core subject — 5 per grade level ───────────────────────
// grade field matches GRADES array values above.
// kw[] is used for keyword-based chip matching when student types a message.

export const SUBJECT_QUESTIONS = {

  mathematics: [
    // Grade 1–2 — Numbers & Basic Operations
    { grade:"Grade 1", q:"What is counting?",                              kw:["count","number","one","two","three"] },
    { grade:"Grade 1", q:"What comes after 10?",                           kw:["number","after","ten","eleven","count"] },
    { grade:"Grade 2", q:"What is addition?",                              kw:["add","plus","addition","sum","total"] },
    { grade:"Grade 2", q:"What is subtraction?",                           kw:["subtract","minus","difference","take away"] },
    { grade:"Grade 3", q:"What are multiplication tables?",                kw:["multiply","times","table","multiplication"] },
    { grade:"Grade 3", q:"What is division?",                              kw:["divide","division","share","split","quotient"] },
    { grade:"Grade 3", q:"What is a fraction?",                            kw:["fraction","half","quarter","numerator","denominator"] },
    { grade:"Grade 4", q:"What is a decimal number?",                      kw:["decimal","point","tenth","hundredth"] },
    { grade:"Grade 4", q:"What is a percentage?",                          kw:["percent","percentage","out of 100","%"] },
    { grade:"Grade 4", q:"How do you find the area of a rectangle?",       kw:["area","rectangle","length","width","square"] },
    // Grade 5–6 — Fractions, Ratios, Integers
    { grade:"Grade 5", q:"What is the order of operations?",               kw:["order","operations","bodmas","pemdas","bracket"] },
    { grade:"Grade 5", q:"What is a ratio?",                               kw:["ratio","proportion","compare","to","relationship"] },
    { grade:"Grade 5", q:"What are negative numbers?",                     kw:["negative","minus","below zero","integer"] },
    { grade:"Grade 6", q:"What is a variable in algebra?",                 kw:["variable","algebra","unknown","letter","x"] },
    { grade:"Grade 6", q:"How do you solve a simple equation?",            kw:["equation","solve","balance","x","algebra"] },
    { grade:"Grade 6", q:"What is the mean of a data set?",                kw:["mean","average","sum","data","statistics"] },
    // Grade 7–8 — Algebra & Geometry
    { grade:"Grade 7", q:"What is a linear equation?",                     kw:["linear","equation","line","slope","graph"] },
    { grade:"Grade 7", q:"What is the Pythagorean theorem?",               kw:["pythagoras","theorem","triangle","hypotenuse","right angle"] },
    { grade:"Grade 7", q:"What are prime numbers?",                        kw:["prime","factor","divisible","number","sieve"] },
    { grade:"Grade 8", q:"What is a quadratic equation?",                  kw:["quadratic","square","parabola","roots","formula"] },
    { grade:"Grade 8", q:"What is a graph in mathematics?",                kw:["graph","plot","axis","coordinate","y=mx+c"] },
    { grade:"Grade 8", q:"What is the area of a circle?",                  kw:["circle","area","pi","radius","circumference"] },
    // Grade 9–10 — Trigonometry, Statistics
    { grade:"Grade 9", q:"What is trigonometry?",                          kw:["trigonometry","sine","cosine","tangent","angle"] },
    { grade:"Grade 9", q:"What is a function in mathematics?",             kw:["function","input","output","f(x)","mapping"] },
    { grade:"Grade 9", q:"What is standard deviation?",                    kw:["standard deviation","spread","statistics","variance","data"] },
    { grade:"Grade 10", q:"What is a logarithm?",                          kw:["logarithm","log","exponent","power","base"] },
    { grade:"Grade 10", q:"What is differentiation?",                      kw:["differentiation","derivative","calculus","rate","change"] },
    { grade:"Grade 10", q:"What is a geometric sequence?",                 kw:["geometric","sequence","ratio","term","series"] },
    // Grade 11–12 — Calculus & Advanced
    { grade:"Grade 11", q:"What is integration in calculus?",              kw:["integration","integral","area","calculus","antiderivative"] },
    { grade:"Grade 11", q:"What is a matrix?",                             kw:["matrix","row","column","determinant","linear algebra"] },
    { grade:"Grade 11", q:"What is probability?",                          kw:["probability","chance","likely","event","outcome"] },
    { grade:"Grade 12", q:"What is a limit in calculus?",                  kw:["limit","approach","calculus","infinity","tends to"] },
    { grade:"Grade 12", q:"What is a vector?",                             kw:["vector","direction","magnitude","scalar","physics"] },
    { grade:"Grade 12", q:"What is Bayes' theorem?",                       kw:["bayes","conditional","probability","theorem","posterior"] },
    // Extra variety
    { grade:"Grade 5", q:"What is the perimeter of a shape?",              kw:["perimeter","boundary","distance","around","shape"] },
    { grade:"Grade 6", q:"What is a coordinate plane?",                    kw:["coordinate","plane","x-axis","y-axis","quadrant"] },
    { grade:"Grade 7", q:"What is the difference between mean, median, and mode?", kw:["mean","median","mode","statistics","average"] },
    { grade:"Grade 8", q:"What is scientific notation?",                   kw:["scientific notation","power","10","large number"] },
    { grade:"Grade 9", q:"What is the quadratic formula?",                 kw:["quadratic formula","roots","discriminant","b squared"] },
    { grade:"Grade 10", q:"What is a polynomial?",                         kw:["polynomial","terms","degree","coefficient","expression"] },
    { grade:"Grade 11", q:"What is the binomial theorem?",                 kw:["binomial","theorem","expand","coefficient","pascal"] },
    { grade:"Grade 12", q:"What is a differential equation?",              kw:["differential equation","dy/dx","model","rate","solve"] },
    { grade:"Grade 3", q:"What are odd and even numbers?",                 kw:["odd","even","number","pattern","divisible"] },
    { grade:"Grade 4", q:"What is the LCM and HCF?",                       kw:["lcm","hcf","common","multiple","factor"] },
    { grade:"Grade 1", q:"What are shapes?",                               kw:["shape","circle","square","triangle","2D"] },
    { grade:"Grade 2", q:"What is place value?",                           kw:["place value","units","tens","hundreds","digit"] },
    { grade:"Grade 11", q:"What is a complex number?",                     kw:["complex","imaginary","real","i","number"] },
    { grade:"Grade 12", q:"What is Euler's identity?",                     kw:["euler","identity","e","pi","imaginary"] },
    { grade:"Grade 9", q:"How do you factorise an expression?",            kw:["factorise","factor","common","bracket","algebra"] },
    { grade:"Grade 10", q:"What is the sine rule?",                        kw:["sine rule","triangle","non-right","angle","law"] },
  ],

  science: [
    // Grade 1–4 — Nature & Basic Science
    { grade:"Grade 1", q:"What are living things?",                        kw:["living","alive","plant","animal","breathe"] },
    { grade:"Grade 1", q:"What is the sun?",                               kw:["sun","star","light","energy","solar"] },
    { grade:"Grade 2", q:"What are the states of matter?",                 kw:["solid","liquid","gas","matter","state"] },
    { grade:"Grade 2", q:"What is weather?",                               kw:["weather","rain","sun","wind","temperature"] },
    { grade:"Grade 3", q:"What is photosynthesis?",                        kw:["photosynthesis","plant","chlorophyll","sunlight","oxygen"] },
    { grade:"Grade 3", q:"What is the food chain?",                        kw:["food chain","predator","prey","producer","consumer"] },
    { grade:"Grade 4", q:"What are atoms?",                                kw:["atom","element","proton","neutron","electron"] },
    { grade:"Grade 4", q:"What is gravity?",                               kw:["gravity","force","pull","mass","weight"] },
    { grade:"Grade 4", q:"What is the water cycle?",                       kw:["water cycle","evaporation","condensation","precipitation","cycle"] },
    { grade:"Grade 5", q:"What is energy?",                                kw:["energy","kinetic","potential","heat","light"] },
    // Grade 5–7 — Physics & Chemistry Intro
    { grade:"Grade 5", q:"What is electricity?",                           kw:["electricity","current","circuit","voltage","battery"] },
    { grade:"Grade 5", q:"What are elements in chemistry?",                kw:["element","periodic table","chemical","symbol","atom"] },
    { grade:"Grade 6", q:"What is a chemical reaction?",                   kw:["chemical reaction","reactant","product","equation","change"] },
    { grade:"Grade 6", q:"What is speed and velocity?",                    kw:["speed","velocity","distance","time","motion"] },
    { grade:"Grade 6", q:"What is the cell — the basic unit of life?",     kw:["cell","nucleus","membrane","organism","biology"] },
    { grade:"Grade 7", q:"What is Newton's first law of motion?",          kw:["newton","law","inertia","force","motion"] },
    { grade:"Grade 7", q:"What is the periodic table?",                    kw:["periodic table","element","group","period","chemistry"] },
    { grade:"Grade 7", q:"What is DNA?",                                   kw:["dna","gene","chromosome","heredity","genetics"] },
    // Grade 8–10 — Deeper Physics, Chemistry, Biology
    { grade:"Grade 8", q:"What is Newton's second law F=ma?",              kw:["force","mass","acceleration","newton","f=ma"] },
    { grade:"Grade 8", q:"What is the pH scale?",                          kw:["ph","acid","base","neutral","alkali"] },
    { grade:"Grade 8", q:"What is mitosis?",                               kw:["mitosis","cell division","chromosome","nucleus","biology"] },
    { grade:"Grade 9", q:"What is Ohm's law?",                             kw:["ohm","voltage","current","resistance","law"] },
    { grade:"Grade 9", q:"What is covalent bonding?",                      kw:["covalent","bond","electron","share","molecule"] },
    { grade:"Grade 9", q:"What is natural selection?",                     kw:["natural selection","evolution","darwin","adaptation","survival"] },
    { grade:"Grade 10", q:"What is electromagnetic radiation?",            kw:["electromagnetic","radiation","wave","spectrum","light"] },
    { grade:"Grade 10", q:"What is the mole concept in chemistry?",        kw:["mole","avogadro","amount","substance","chemistry"] },
    { grade:"Grade 10", q:"What is the nervous system?",                   kw:["nervous system","neuron","brain","reflex","signal"] },
    // Grade 11–12 — Advanced Science
    { grade:"Grade 11", q:"What is quantum mechanics?",                    kw:["quantum","mechanics","wave","particle","uncertainty"] },
    { grade:"Grade 11", q:"What is thermodynamics?",                       kw:["thermodynamics","heat","entropy","law","energy"] },
    { grade:"Grade 11", q:"What is gene expression?",                      kw:["gene expression","transcription","translation","mrna","protein"] },
    { grade:"Grade 12", q:"What is special relativity?",                   kw:["relativity","einstein","speed of light","time","space"] },
    { grade:"Grade 12", q:"What is nuclear fission?",                      kw:["nuclear","fission","atom","energy","chain reaction"] },
    { grade:"Grade 12", q:"What is the theory of evolution?",              kw:["evolution","darwin","species","mutation","selection"] },
    // Extra variety
    { grade:"Grade 3", q:"What is an ecosystem?",                          kw:["ecosystem","habitat","environment","species","balance"] },
    { grade:"Grade 5", q:"What is friction?",                              kw:["friction","force","surface","resistance","heat"] },
    { grade:"Grade 6", q:"What is the human digestive system?",            kw:["digestive","stomach","intestine","food","digest"] },
    { grade:"Grade 7", q:"What is sound and how does it travel?",          kw:["sound","wave","vibration","frequency","amplitude"] },
    { grade:"Grade 8", q:"What is the greenhouse effect?",                 kw:["greenhouse","effect","climate","co2","warming"] },
    { grade:"Grade 9", q:"What is the difference between ionic and covalent bonds?", kw:["ionic","covalent","bond","difference","electron"] },
    { grade:"Grade 10", q:"What is homeostasis?",                          kw:["homeostasis","balance","body","temperature","regulation"] },
    { grade:"Grade 11", q:"What is the uncertainty principle?",            kw:["uncertainty","heisenberg","quantum","position","momentum"] },
    { grade:"Grade 12", q:"What is CRISPR gene editing?",                  kw:["crispr","gene","edit","dna","biotechnology"] },
    { grade:"Grade 4", q:"What is a magnet?",                              kw:["magnet","magnetic","pole","attract","repel"] },
    { grade:"Grade 2", q:"Why do objects fall?",                           kw:["fall","gravity","down","weight","force"] },
    { grade:"Grade 1", q:"What do plants need to grow?",                   kw:["plant","grow","water","sunlight","soil"] },
    { grade:"Grade 11", q:"What is organic chemistry?",                    kw:["organic","carbon","compound","chemistry","hydrocarbon"] },
    { grade:"Grade 12", q:"What is a black hole?",                         kw:["black hole","gravity","light","space","singularity"] },
    { grade:"Grade 9", q:"What is respiration in biology?",                kw:["respiration","oxygen","glucose","energy","atp"] },
    { grade:"Grade 10", q:"What is momentum?",                             kw:["momentum","mass","velocity","conservation","collision"] },
  ],

  english: [
    { grade:"Grade 1", q:"What is a noun?",                                kw:["noun","name","person","place","thing"] },
    { grade:"Grade 1", q:"What is a verb?",                                kw:["verb","action","do","run","jump","word"] },
    { grade:"Grade 2", q:"What is an adjective?",                          kw:["adjective","describe","colour","size","quality"] },
    { grade:"Grade 2", q:"What is a sentence?",                            kw:["sentence","subject","predicate","full stop","capital"] },
    { grade:"Grade 3", q:"What is a paragraph?",                           kw:["paragraph","indent","topic","sentence","idea"] },
    { grade:"Grade 3", q:"What is punctuation?",                           kw:["punctuation","comma","full stop","question mark","apostrophe"] },
    { grade:"Grade 4", q:"What is the difference between fiction and non-fiction?", kw:["fiction","non-fiction","story","real","made up"] },
    { grade:"Grade 4", q:"What is a simile?",                              kw:["simile","like","as","compare","figure of speech"] },
    { grade:"Grade 5", q:"What is a metaphor?",                            kw:["metaphor","compare","is","figure of speech","imagery"] },
    { grade:"Grade 5", q:"What is the theme of a story?",                  kw:["theme","message","idea","story","lesson"] },
    { grade:"Grade 6", q:"What is a pronoun?",                             kw:["pronoun","he","she","they","replace","noun"] },
    { grade:"Grade 6", q:"What is an adverb?",                             kw:["adverb","how","when","where","modify","verb"] },
    { grade:"Grade 7", q:"What is narrative writing?",                     kw:["narrative","story","character","plot","setting"] },
    { grade:"Grade 7", q:"What is persuasive writing?",                    kw:["persuasive","argue","convince","opinion","essay"] },
    { grade:"Grade 7", q:"What is the structure of an essay?",             kw:["essay","introduction","body","conclusion","structure"] },
    { grade:"Grade 8", q:"What is alliteration?",                          kw:["alliteration","sound","letter","repetition","poetry"] },
    { grade:"Grade 8", q:"What is foreshadowing in literature?",           kw:["foreshadowing","hint","clue","later","predict"] },
    { grade:"Grade 8", q:"What is the difference between first and third person?", kw:["first person","third person","narrator","I","he","she"] },
    { grade:"Grade 9", q:"What is characterisation in a novel?",           kw:["characterisation","character","develop","direct","indirect"] },
    { grade:"Grade 9", q:"What is a thesis statement?",                    kw:["thesis","statement","argument","essay","main idea"] },
    { grade:"Grade 9", q:"What is dramatic irony?",                        kw:["dramatic irony","audience","character","knows","irony"] },
    { grade:"Grade 10", q:"What is the difference between connotation and denotation?", kw:["connotation","denotation","meaning","word","imply"] },
    { grade:"Grade 10", q:"What is a sonnet?",                             kw:["sonnet","poem","14","lines","rhyme","shakespeare"] },
    { grade:"Grade 10", q:"How do you analyse a poem?",                    kw:["analyse","poem","structure","language","effect"] },
    { grade:"Grade 11", q:"What is postcolonial literature?",              kw:["postcolonial","literature","empire","identity","culture"] },
    { grade:"Grade 11", q:"What is a stream of consciousness narrative?",  kw:["stream of consciousness","thoughts","modernism","narrative","technique"] },
    { grade:"Grade 11", q:"What is the unreliable narrator?",              kw:["unreliable narrator","trust","point of view","story","bias"] },
    { grade:"Grade 12", q:"What is the difference between syntax and semantics?", kw:["syntax","semantics","structure","meaning","language"] },
    { grade:"Grade 12", q:"What is magical realism in literature?",        kw:["magical realism","fantasy","reality","literature","marquez"] },
    { grade:"Grade 12", q:"What is a critical essay?",                     kw:["critical essay","analyse","argument","evidence","evaluation"] },
    { grade:"Grade 5", q:"What is a conjunction?",                         kw:["conjunction","and","but","because","connect"] },
    { grade:"Grade 6", q:"What is active voice vs passive voice?",         kw:["active","passive","voice","subject","verb"] },
    { grade:"Grade 7", q:"What is onomatopoeia?",                          kw:["onomatopoeia","sound","word","bang","crash","buzz"] },
    { grade:"Grade 8", q:"What is the plot structure of a story?",         kw:["plot","exposition","rising action","climax","resolution"] },
    { grade:"Grade 9", q:"What is a rhetorical question?",                 kw:["rhetorical","question","effect","answer","persuade"] },
    { grade:"Grade 10", q:"What is irony in literature?",                  kw:["irony","opposite","verbal","situational","dramatic"] },
    { grade:"Grade 11", q:"What is existentialism in literature?",         kw:["existentialism","meaning","sartre","camus","freedom"] },
    { grade:"Grade 12", q:"What is intertextuality?",                      kw:["intertextuality","reference","text","allusion","connection"] },
    { grade:"Grade 3", q:"What are synonyms and antonyms?",                kw:["synonym","antonym","opposite","same","word"] },
    { grade:"Grade 4", q:"What is a prefix and a suffix?",                 kw:["prefix","suffix","word","meaning","root"] },
    { grade:"Grade 2", q:"What is a rhyme?",                               kw:["rhyme","sound","poem","end","word"] },
    { grade:"Grade 1", q:"What are vowels and consonants?",                kw:["vowel","consonant","letter","alphabet","sound"] },
    { grade:"Grade 6", q:"What is point of view in a story?",              kw:["point of view","perspective","narrator","first","third"] },
    { grade:"Grade 7", q:"What is imagery in writing?",                    kw:["imagery","senses","picture","describe","language"] },
    { grade:"Grade 8", q:"How do you write a book review?",                kw:["book review","summary","opinion","evaluate","recommend"] },
    { grade:"Grade 9", q:"What is symbolism in literature?",               kw:["symbolism","symbol","meaning","represent","deeper"] },
    { grade:"Grade 10", q:"What is a motif in literature?",                kw:["motif","recurring","theme","symbol","pattern"] },
    { grade:"Grade 11", q:"What is feminist literary criticism?",          kw:["feminist","criticism","gender","literature","theory"] },
    { grade:"Grade 12", q:"What is deconstruction in literary theory?",    kw:["deconstruction","derrida","meaning","text","theory"] },
    { grade:"Grade 5", q:"What is a topic sentence?",                      kw:["topic sentence","paragraph","main idea","first","sentence"] },
  ],

  history: [
    { grade:"Grade 1", q:"What is history?",                               kw:["history","past","event","time","story"] },
    { grade:"Grade 2", q:"What is a community?",                           kw:["community","neighbourhood","people","together","village"] },
    { grade:"Grade 3", q:"What were ancient civilisations?",               kw:["ancient","civilisation","egypt","rome","greece","mesopotamia"] },
    { grade:"Grade 3", q:"What was life like in ancient Egypt?",           kw:["ancient egypt","pharaoh","pyramid","nile","civilization"] },
    { grade:"Grade 4", q:"What was the Roman Empire?",                     kw:["roman","empire","rome","caesar","republic","latin"] },
    { grade:"Grade 4", q:"What was the Silk Road?",                        kw:["silk road","trade","china","india","route","merchant"] },
    { grade:"Grade 5", q:"What were the causes of World War I?",           kw:["world war 1","ww1","cause","alliance","assassination","1914"] },
    { grade:"Grade 5", q:"What was the Industrial Revolution?",            kw:["industrial revolution","factory","steam","invention","18th century"] },
    { grade:"Grade 6", q:"What was the Cold War?",                         kw:["cold war","usa","ussr","nuclear","communism","arms race"] },
    { grade:"Grade 6", q:"What was the Holocaust?",                        kw:["holocaust","nazi","world war 2","genocide","jewish","hitler"] },
    { grade:"Grade 7", q:"What was the French Revolution?",                kw:["french revolution","liberty","equality","napoleon","1789","guillotine"] },
    { grade:"Grade 7", q:"What was colonialism?",                          kw:["colonialism","empire","colony","explore","africa","asia"] },
    { grade:"Grade 7", q:"What was the American Civil War?",               kw:["american civil war","slavery","lincoln","confederate","union","1861"] },
    { grade:"Grade 8", q:"What caused World War II?",                      kw:["world war 2","ww2","hitler","nazi","1939","cause"] },
    { grade:"Grade 8", q:"What was the Civil Rights Movement?",            kw:["civil rights","martin luther king","segregation","protest","america"] },
    { grade:"Grade 8", q:"What was apartheid?",                            kw:["apartheid","south africa","mandela","segregation","racism"] },
    { grade:"Grade 9", q:"What was the Russian Revolution?",               kw:["russian revolution","tsar","bolshevik","1917","communist","lenin"] },
    { grade:"Grade 9", q:"What was the Great Depression?",                 kw:["great depression","1929","economy","unemployment","crash","wall street"] },
    { grade:"Grade 9", q:"What was the role of the United Nations?",       kw:["united nations","un","peace","international","cooperation","1945"] },
    { grade:"Grade 10", q:"What was Decolonisation?",                      kw:["decolonisation","independence","africa","asia","empire","1960s"] },
    { grade:"Grade 10", q:"What was the Vietnam War?",                     kw:["vietnam","war","usa","communism","protests","1960s"] },
    { grade:"Grade 10", q:"What is democracy?",                            kw:["democracy","vote","election","government","rights"] },
    { grade:"Grade 11", q:"What was the Cuban Missile Crisis?",            kw:["cuba","missile","crisis","kennedy","khrushchev","nuclear","1962"] },
    { grade:"Grade 11", q:"What were the causes of the First World War?",  kw:["ww1","causes","nationalism","imperialism","alliances","assassination"] },
    { grade:"Grade 11", q:"How did Gandhi lead India to independence?",    kw:["gandhi","india","independence","non-violence","british","1947"] },
    { grade:"Grade 12", q:"What is globalisation and its historical roots?",kw:["globalisation","trade","economy","world","interconnected"] },
    { grade:"Grade 12", q:"What were the Nuremberg Trials?",               kw:["nuremberg","trial","war crimes","nazi","holocaust","justice"] },
    { grade:"Grade 12", q:"What was the role of propaganda in history?",   kw:["propaganda","media","war","government","influence","persuade"] },
    { grade:"Grade 5", q:"What was the Renaissance?",                      kw:["renaissance","art","science","rebirth","europe","14th century"] },
    { grade:"Grade 6", q:"What was the Age of Exploration?",               kw:["exploration","columbus","vasco da gama","new world","discovery"] },
    { grade:"Grade 7", q:"What was the Ottoman Empire?",                   kw:["ottoman","empire","turkey","sultan","islam","middle east"] },
    { grade:"Grade 8", q:"What was Partition of India?",                   kw:["partition","india","pakistan","1947","independence","british"] },
    { grade:"Grade 9", q:"What was the Moon landing?",                     kw:["moon landing","apollo","nasa","1969","space","astronaut"] },
    { grade:"Grade 10", q:"What was the Berlin Wall?",                     kw:["berlin wall","germany","divided","cold war","1989","fall"] },
    { grade:"Grade 11", q:"What was the Rwandan Genocide?",                kw:["rwanda","genocide","1994","hutu","tutsi","africa"] },
    { grade:"Grade 12", q:"What is the significance of the UN Declaration of Human Rights?", kw:["human rights","declaration","un","1948","universal","rights"] },
    { grade:"Grade 3", q:"What was ancient Greece?",                       kw:["greece","ancient","democracy","olympics","philosophy","city state"] },
    { grade:"Grade 4", q:"Who were the Vikings?",                          kw:["vikings","norse","scandinavia","explore","raid","longship"] },
    { grade:"Grade 2", q:"What is a map?",                                 kw:["map","geography","country","continent","location"] },
    { grade:"Grade 1", q:"Who are community helpers?",                     kw:["community","helper","doctor","teacher","police","firefighter"] },
    { grade:"Grade 6", q:"What was the Mughal Empire?",                    kw:["mughal","empire","india","akbar","taj mahal","islamic"] },
    { grade:"Grade 7", q:"What was the Boston Tea Party?",                 kw:["boston tea party","american revolution","british","protest","1773"] },
    { grade:"Grade 8", q:"What was the Trans-Atlantic Slave Trade?",       kw:["slave trade","atlantic","africa","america","slavery","triangle"] },
    { grade:"Grade 9", q:"What were the causes of the Cold War?",          kw:["cold war","cause","usa","ussr","ideology","tension"] },
    { grade:"Grade 10", q:"What was the Space Race?",                      kw:["space race","nasa","ussr","sputnik","astronaut","cold war"] },
    { grade:"Grade 11", q:"What was the Arab Spring?",                     kw:["arab spring","protest","middle east","democracy","2011","revolution"] },
    { grade:"Grade 12", q:"How did the internet change history?",          kw:["internet","technology","history","digital","revolution","change"] },
    { grade:"Grade 5", q:"What was World War II?",                         kw:["world war 2","ww2","hitler","allies","axis","1939"] },
    { grade:"Grade 6", q:"What was the Mexican Revolution?",               kw:["mexican revolution","1910","zapata","villa","mexico","independence"] },
    { grade:"Grade 10", q:"What was the Tiananmen Square protest?",        kw:["tiananmen","china","protest","1989","communist","student"] },
  ],

  cs: [
    { grade:"Grade 3", q:"What is an algorithm?",                          kw:["algorithm","steps","plan","sequence","instruction"] },
    { grade:"Grade 3", q:"What is a sequence in programming?",             kw:["sequence","order","instruction","step","run"] },
    { grade:"Grade 4", q:"What is a loop?",                                kw:["loop","repeat","iteration","again","cycle"] },
    { grade:"Grade 4", q:"What is a for loop?",                            kw:["for loop","count","iterate","times","range"] },
    { grade:"Grade 4", q:"What is a while loop?",                          kw:["while","condition","loop","repeat","until"] },
    { grade:"Grade 5", q:"What is an if-statement?",                       kw:["if","condition","check","true","false"] },
    { grade:"Grade 5", q:"What is a boolean?",                             kw:["boolean","true","false","logic","condition"] },
    { grade:"Grade 5", q:"What is an else block?",                         kw:["else","if","branch","otherwise","condition"] },
    { grade:"Grade 6", q:"What is a variable?",                            kw:["variable","store","data","value","assign"] },
    { grade:"Grade 6", q:"What are data types?",                           kw:["data type","string","integer","float","boolean"] },
    { grade:"Grade 6", q:"What is a string?",                              kw:["string","text","word","character","quote"] },
    { grade:"Grade 7", q:"What is a function?",                            kw:["function","def","procedure","block","reuse"] },
    { grade:"Grade 7", q:"What is a parameter?",                           kw:["parameter","argument","input","function","pass"] },
    { grade:"Grade 7", q:"What is a return value?",                        kw:["return","value","output","function","result"] },
    { grade:"Grade 8", q:"What is an array?",                              kw:["array","list","index","collection","element"] },
    { grade:"Grade 8", q:"How do you loop through an array?",              kw:["array","loop","iterate","for","each"] },
    { grade:"Grade 8", q:"What is the first index of an array?",           kw:["index","zero","first","array","0"] },
    { grade:"Grade 9", q:"What is a class in OOP?",                        kw:["class","object","oop","blueprint","design"] },
    { grade:"Grade 9", q:"What is inheritance?",                           kw:["inheritance","parent","child","extend","class"] },
    { grade:"Grade 9", q:"What is encapsulation?",                         kw:["encapsulation","private","hide","data","oop"] },
    { grade:"Grade 10", q:"What is recursion?",                            kw:["recursion","recursive","self","call","stack"] },
    { grade:"Grade 10", q:"What is a base case in recursion?",             kw:["base case","stop","recursion","terminate","condition"] },
    { grade:"Grade 10", q:"What is the call stack?",                       kw:["call stack","stack","memory","function","recursion"] },
    { grade:"Grade 11", q:"How does binary search work?",                  kw:["binary search","sorted","half","divide","search"] },
    { grade:"Grade 11", q:"What is bubble sort?",                          kw:["bubble sort","swap","compare","sort","algorithm"] },
    { grade:"Grade 11", q:"What is O(n) time complexity?",                 kw:["complexity","big o","on","time","efficient"] },
    { grade:"Grade 12", q:"What is a linked list?",                        kw:["linked list","node","pointer","chain","structure"] },
    { grade:"Grade 12", q:"What is a stack data structure?",               kw:["stack","lifo","push","pop","data"] },
    { grade:"Grade 12", q:"What is a hash table?",                         kw:["hash","key","value","lookup","table"] },
    { grade:"Grade 12", q:"What is a binary tree?",                        kw:["binary tree","node","root","leaf","traversal"] },
    { grade:"Grade 3", q:"What is a pattern in coding?",                   kw:["pattern","repeat","sequence","code","design"] },
    { grade:"Grade 4", q:"Why do we use loops in programming?",            kw:["loop","reason","why","repeat","efficient"] },
    { grade:"Grade 5", q:"What is the difference between true and false?", kw:["true","false","boolean","difference","logic"] },
    { grade:"Grade 6", q:"How do you change the value of a variable?",     kw:["variable","assign","change","update","="] },
    { grade:"Grade 7", q:"Why do we use functions?",                       kw:["function","why","reuse","organize","modular"] },
    { grade:"Grade 8", q:"What is the difference between a list and an array?", kw:["list","array","difference","dynamic","static"] },
    { grade:"Grade 9", q:"What is polymorphism?",                          kw:["polymorphism","oop","method","override","interface"] },
    { grade:"Grade 10", q:"How does recursion differ from a loop?",        kw:["recursion","loop","difference","compare","when"] },
    { grade:"Grade 11", q:"What is merge sort?",                           kw:["merge sort","divide","conquer","sort","algorithm"] },
    { grade:"Grade 12", q:"What is a graph data structure?",               kw:["graph","vertex","edge","directed","undirected"] },
    { grade:"Grade 5", q:"What is a comment in code?",                     kw:["comment","explain","#","//","ignore"] },
    { grade:"Grade 6", q:"What is an integer vs a float?",                 kw:["integer","float","decimal","number","type"] },
    { grade:"Grade 7", q:"What is a function call?",                       kw:["call","invoke","function","run","execute"] },
    { grade:"Grade 8", q:"How do you add an item to a list?",              kw:["append","add","push","list","array"] },
    { grade:"Grade 9", q:"What is a constructor in OOP?",                  kw:["constructor","init","object","create","class"] },
    { grade:"Grade 10", q:"What is memoisation?",                          kw:["memoisation","cache","recursion","dynamic","store"] },
    { grade:"Grade 11", q:"What is a greedy algorithm?",                   kw:["greedy","algorithm","optimal","choice","local"] },
    { grade:"Grade 12", q:"What is dynamic programming?",                  kw:["dynamic programming","subproblem","optimal","dp","store"] },
    { grade:"Grade 3", q:"Can you give an example of an algorithm in real life?", kw:["algorithm","real life","example","recipe","directions"] },
    { grade:"Grade 4", q:"What happens in an infinite loop?",              kw:["infinite loop","forever","crash","stop","hang"] },
  ],

  ai: [
    { grade:"Grade 3", q:"What is artificial intelligence?",               kw:["ai","artificial","intelligence","smart","computer"] },
    { grade:"Grade 3", q:"Where do you see AI in everyday life?",          kw:["ai","everyday","example","siri","alexa","life"] },
    { grade:"Grade 4", q:"How do computers learn from data?",              kw:["learn","data","computer","training","examples"] },
    { grade:"Grade 4", q:"What is training data?",                         kw:["training","data","example","teach","learn"] },
    { grade:"Grade 5", q:"How does AI recognise patterns?",                kw:["pattern","recognition","feature","detect","find"] },
    { grade:"Grade 5", q:"What is image recognition?",                     kw:["image","recognition","picture","see","detect"] },
    { grade:"Grade 6", q:"What is machine learning?",                      kw:["machine learning","ml","learn","data","model"] },
    { grade:"Grade 6", q:"What is a model in machine learning?",           kw:["model","ml","train","predict","output"] },
    { grade:"Grade 6", q:"What is a dataset?",                             kw:["dataset","data","examples","training","collection"] },
    { grade:"Grade 7", q:"What is a neural network?",                      kw:["neural network","neuron","layer","brain","deep"] },
    { grade:"Grade 7", q:"What is a layer in a neural network?",           kw:["layer","input","hidden","output","network"] },
    { grade:"Grade 7", q:"How do neural networks learn?",                  kw:["learn","weight","network","training","backpropagation"] },
    { grade:"Grade 8", q:"What is overfitting?",                           kw:["overfitting","memorise","training","generalise","overfit"] },
    { grade:"Grade 8", q:"Why do we split data into training and test sets?", kw:["split","training","test","evaluate","data"] },
    { grade:"Grade 8", q:"What is underfitting?",                          kw:["underfitting","simple","model","underfit","poor"] },
    { grade:"Grade 9", q:"What is supervised learning?",                   kw:["supervised","label","classification","train","output"] },
    { grade:"Grade 9", q:"What is unsupervised learning?",                 kw:["unsupervised","cluster","unlabeled","group","pattern"] },
    { grade:"Grade 9", q:"What is reinforcement learning?",                kw:["reinforcement","reward","agent","action","learn"] },
    { grade:"Grade 10", q:"What is K-means clustering?",                   kw:["k-means","cluster","centroid","unsupervised","group"] },
    { grade:"Grade 10", q:"What is dimensionality reduction?",             kw:["dimensionality","reduction","pca","feature","simplify"] },
    { grade:"Grade 10", q:"What is a decision tree?",                      kw:["decision tree","node","split","classify","tree"] },
    { grade:"Grade 11", q:"How does ChatGPT work?",                        kw:["chatgpt","gpt","llm","language model","generate"] },
    { grade:"Grade 11", q:"What is NLP?",                                  kw:["nlp","natural language","text","language","process"] },
    { grade:"Grade 11", q:"What is computer vision?",                      kw:["computer vision","image","detect","visual","cv"] },
    { grade:"Grade 11", q:"What is sentiment analysis?",                   kw:["sentiment","opinion","positive","negative","text"] },
    { grade:"Grade 12", q:"What is a transformer model?",                  kw:["transformer","attention","gpt","bert","model"] },
    { grade:"Grade 12", q:"What is deep learning?",                        kw:["deep learning","layers","neural","deep","train"] },
    { grade:"Grade 12", q:"What is AI bias?",                              kw:["bias","unfair","data","training","ethics"] },
    { grade:"Grade 12", q:"Why does fairness in AI matter?",               kw:["fairness","ethics","harm","responsible","bias"] },
    { grade:"Grade 12", q:"What are the risks of AI in society?",          kw:["risk","society","ethics","danger","ai"] },
    { grade:"Grade 4", q:"What happens when AI gets bad training data?",   kw:["bad data","quality","wrong","bias","garbage"] },
    { grade:"Grade 5", q:"Why does AI need lots of examples to learn?",    kw:["examples","data","learn","why","training"] },
    { grade:"Grade 6", q:"How is machine learning different from normal coding?", kw:["ml","difference","code","rules","program"] },
    { grade:"Grade 7", q:"How does the human brain inspire AI?",           kw:["brain","neuron","inspire","biology","imitate"] },
    { grade:"Grade 8", q:"What is validation data used for?",              kw:["validation","tune","evaluate","model","data"] },
    { grade:"Grade 9", q:"What is a classifier?",                          kw:["classifier","classify","category","label","ml"] },
    { grade:"Grade 10", q:"What is an anomaly in data?",                   kw:["anomaly","outlier","unusual","detect","data"] },
    { grade:"Grade 11", q:"How does speech recognition work?",             kw:["speech","voice","recognition","audio","transcribe"] },
    { grade:"Grade 12", q:"What is a generative AI model?",                kw:["generative","generate","image","text","diffusion"] },
    { grade:"Grade 3", q:"Can robots think like humans?",                  kw:["robot","think","human","feel","intelligence"] },
    { grade:"Grade 4", q:"What is a prediction in AI?",                    kw:["prediction","output","guess","forecast","ai"] },
    { grade:"Grade 5", q:"What is a label in AI training?",                kw:["label","tag","category","training","data"] },
    { grade:"Grade 6", q:"What does it mean to train a model?",            kw:["train","model","process","learn","data"] },
    { grade:"Grade 7", q:"What is a node in a neural network?",            kw:["node","neuron","unit","activate","network"] },
    { grade:"Grade 8", q:"How does data quality affect AI performance?",   kw:["data quality","garbage in","performance","clean","accurate"] },
    { grade:"Grade 9", q:"What is a confusion matrix?",                    kw:["confusion matrix","accuracy","precision","recall","classify"] },
    { grade:"Grade 10", q:"What is feature engineering?",                  kw:["feature","engineering","input","variable","ml"] },
    { grade:"Grade 11", q:"What is transfer learning?",                    kw:["transfer","learning","pretrained","fine tune","model"] },
    { grade:"Grade 12", q:"What is explainable AI?",                       kw:["explainable","interpretable","black box","trust","ai"] },
    { grade:"Grade 3", q:"What is one cool thing AI can do?",              kw:["ai","cool","example","ability","do"] },
    { grade:"Grade 4", q:"How does AI get smarter over time?",             kw:["smarter","improve","learn","update","ai"] },
  ],

  webdev: [
    { grade:"Grade 3", q:"What is a website?",                             kw:["website","page","internet","web","online"] },
    { grade:"Grade 3", q:"How does the internet work?",                    kw:["internet","server","network","connect","data"] },
    { grade:"Grade 4", q:"What is HTML?",                                  kw:["html","markup","tag","structure","page"] },
    { grade:"Grade 4", q:"What does the body tag do?",                     kw:["body","html","tag","content","visible"] },
    { grade:"Grade 4", q:"What is a heading tag?",                         kw:["heading","h1","h2","tag","html"] },
    { grade:"Grade 5", q:"What is an HTML attribute?",                     kw:["attribute","property","value","html","tag"] },
    { grade:"Grade 5", q:"How do I add a link in HTML?",                   kw:["link","anchor","href","a","html"] },
    { grade:"Grade 5", q:"How do I add an image in HTML?",                 kw:["image","img","src","html","picture"] },
    { grade:"Grade 6", q:"What is CSS?",                                   kw:["css","style","design","colour","appearance"] },
    { grade:"Grade 6", q:"What is a CSS selector?",                        kw:["selector","class","id","css","target"] },
    { grade:"Grade 6", q:"How do I change font size in CSS?",              kw:["font","size","css","text","px"] },
    { grade:"Grade 7", q:"What is flexbox?",                               kw:["flexbox","flex","layout","align","row"] },
    { grade:"Grade 7", q:"What is CSS grid?",                              kw:["grid","layout","columns","rows","css"] },
    { grade:"Grade 7", q:"What is the CSS box model?",                     kw:["box model","padding","margin","border","css"] },
    { grade:"Grade 7", q:"How do I centre elements in CSS?",               kw:["centre","center","align","middle","css"] },
    { grade:"Grade 8", q:"What is JavaScript?",                            kw:["javascript","js","script","dynamic","code"] },
    { grade:"Grade 8", q:"How do I select an element with JavaScript?",    kw:["select","queryselector","element","dom","js"] },
    { grade:"Grade 8", q:"What is an event listener?",                     kw:["event","listener","click","addeventlistener","js"] },
    { grade:"Grade 9", q:"What is the DOM?",                               kw:["dom","document","tree","html","javascript"] },
    { grade:"Grade 9", q:"How do I handle a button click?",                kw:["button","click","event","handle","js"] },
    { grade:"Grade 9", q:"What is querySelector?",                         kw:["queryselector","select","dom","element","js"] },
    { grade:"Grade 10", q:"What is responsive design?",                    kw:["responsive","mobile","screen","adapt","design"] },
    { grade:"Grade 10", q:"What is a media query?",                        kw:["media query","responsive","breakpoint","screen","css"] },
    { grade:"Grade 10", q:"What is mobile-first design?",                  kw:["mobile first","design","responsive","small","screen"] },
    { grade:"Grade 11", q:"What is an API?",                               kw:["api","endpoint","request","response","data"] },
    { grade:"Grade 11", q:"How does fetch work in JavaScript?",            kw:["fetch","api","request","http","js"] },
    { grade:"Grade 11", q:"What is JSON?",                                 kw:["json","data","format","object","api"] },
    { grade:"Grade 11", q:"What is async/await?",                          kw:["async","await","promise","asynchronous","js"] },
    { grade:"Grade 12", q:"What is React?",                                kw:["react","component","library","ui","jsx"] },
    { grade:"Grade 12", q:"What is useState in React?",                    kw:["usestate","state","hook","react","update"] },
    { grade:"Grade 12", q:"What are props in React?",                      kw:["props","pass","component","react","data"] },
    { grade:"Grade 12", q:"What is the virtual DOM?",                      kw:["virtual dom","dom","react","performance","diff"] },
    { grade:"Grade 3", q:"What is a browser?",                             kw:["browser","chrome","firefox","open","web"] },
    { grade:"Grade 3", q:"What is a URL?",                                 kw:["url","address","link","http","www"] },
    { grade:"Grade 4", q:"What is an HTML element?",                       kw:["element","tag","html","opening","closing"] },
    { grade:"Grade 5", q:"What does the anchor tag do?",                   kw:["anchor","a tag","link","href","navigate"] },
    { grade:"Grade 6", q:"What is the difference between class and ID in CSS?", kw:["class","id","css","difference","selector"] },
    { grade:"Grade 7", q:"What is padding vs margin in CSS?",              kw:["padding","margin","spacing","box model","difference"] },
    { grade:"Grade 8", q:"How do I change text content with JavaScript?",  kw:["innertext","textcontent","change","dom","js"] },
    { grade:"Grade 9", q:"What is the difference between innerHTML and innerText?", kw:["innerhtml","innertext","dom","difference","text"] },
    { grade:"Grade 10", q:"What is a CSS breakpoint?",                     kw:["breakpoint","width","responsive","media","css"] },
    { grade:"Grade 11", q:"How do you handle errors with fetch?",          kw:["error","catch","try","fetch","handle"] },
    { grade:"Grade 12", q:"What is a React component?",                    kw:["component","react","function","reuse","ui"] },
    { grade:"Grade 6", q:"How do I change text colour with CSS?",          kw:["color","colour","text","css","style"] },
    { grade:"Grade 7", q:"How does display:flex work?",                    kw:["display flex","flexbox","layout","css","direction"] },
    { grade:"Grade 8", q:"What is a JavaScript variable?",                 kw:["variable","let","const","var","js"] },
    { grade:"Grade 9", q:"What is event bubbling?",                        kw:["event bubbling","bubble","dom","event","propagate"] },
    { grade:"Grade 10", q:"How do I make images responsive?",              kw:["image","responsive","width","fluid","max-width"] },
    { grade:"Grade 11", q:"What is a REST API?",                           kw:["rest","api","get","post","endpoint","http"] },
    { grade:"Grade 12", q:"What is useEffect in React?",                   kw:["useeffect","hook","side effect","react","lifecycle"] },
  ],

  blocks: [
    { grade:"Grade 3", q:"What is Scratch?",                               kw:["scratch","block","visual","beginner","mit"] },
    { grade:"Grade 3", q:"What is a sprite in Scratch?",                   kw:["sprite","character","scratch","move","costume"] },
    { grade:"Grade 3", q:"How do I make a sprite move?",                   kw:["move","sprite","steps","motion","scratch"] },
    { grade:"Grade 3", q:"What is a backdrop in Scratch?",                 kw:["backdrop","background","scene","stage","scratch"] },
    { grade:"Grade 4", q:"What does the green flag do?",                   kw:["green flag","start","run","event","scratch"] },
    { grade:"Grade 4", q:"What is an event in Scratch?",                   kw:["event","trigger","when","action","scratch"] },
    { grade:"Grade 4", q:"What is a broadcast in Scratch?",                kw:["broadcast","message","receive","send","scratch"] },
    { grade:"Grade 4", q:"What is a costume in Scratch?",                  kw:["costume","look","sprite","animation","switch"] },
    { grade:"Grade 5", q:"What is a forever loop in Scratch?",             kw:["forever","loop","continuous","always","scratch"] },
    { grade:"Grade 5", q:"What is the repeat block?",                      kw:["repeat","times","loop","block","scratch"] },
    { grade:"Grade 5", q:"How do I animate a sprite using loops?",         kw:["animate","loop","costume","sprite","switch"] },
    { grade:"Grade 6", q:"How do I use if-then in Scratch?",               kw:["if-then","condition","block","check","scratch"] },
    { grade:"Grade 6", q:"What is an if-else block?",                      kw:["if-else","condition","otherwise","branch","scratch"] },
    { grade:"Grade 6", q:"How do I detect a collision in Scratch?",        kw:["touching","collision","detect","sprite","scratch"] },
    { grade:"Grade 7", q:"How do I make a variable in Scratch?",           kw:["variable","create","data","store","scratch"] },
    { grade:"Grade 7", q:"How do I keep score in a game?",                 kw:["score","variable","game","point","change"] },
    { grade:"Grade 7", q:"How do I reset a variable?",                     kw:["reset","variable","zero","set","scratch"] },
    { grade:"Grade 8", q:"What is a My Block in Scratch?",                 kw:["my block","custom","define","function","scratch"] },
    { grade:"Grade 8", q:"How do I create a custom block?",                kw:["custom block","create","define","my block","scratch"] },
    { grade:"Grade 8", q:"What is a parameter in a My Block?",             kw:["parameter","input","argument","my block","scratch"] },
    { grade:"Grade 9", q:"What is cloning in Scratch?",                    kw:["clone","copy","duplicate","sprite","scratch"] },
    { grade:"Grade 9", q:"How do I use lists in Scratch?",                 kw:["list","array","add","delete","scratch"] },
    { grade:"Grade 9", q:"How do I loop through a list?",                  kw:["list","loop","iterate","item","scratch"] },
    { grade:"Grade 10", q:"How does Python compare to Scratch?",           kw:["python","scratch","compare","text","block"] },
    { grade:"Grade 10", q:"What is the print function in Python?",         kw:["print","output","python","display","console"] },
    { grade:"Grade 10", q:"What is indentation in Python?",                kw:["indent","space","tab","python","block"] },
    { grade:"Grade 11", q:"How do I define a function in Python?",         kw:["def","function","define","python","create"] },
    { grade:"Grade 11", q:"What is a return value in Python?",             kw:["return","value","output","function","python"] },
    { grade:"Grade 11", q:"What is a parameter in Python?",                kw:["parameter","argument","input","function","python"] },
    { grade:"Grade 12", q:"What is a module in Python?",                   kw:["module","import","library","file","python"] },
    { grade:"Grade 12", q:"How do I import a module?",                     kw:["import","module","use","library","python"] },
    { grade:"Grade 12", q:"What is __main__ in Python?",                   kw:["__main__","main","entry","run","python"] },
    { grade:"Grade 3", q:"How do I add sound in Scratch?",                 kw:["sound","audio","music","play","scratch"] },
    { grade:"Grade 4", q:"How do I use the 'when key pressed' block?",     kw:["key","pressed","input","keyboard","scratch"] },
    { grade:"Grade 5", q:"What is the difference between repeat and forever?", kw:["repeat","forever","difference","loop","scratch"] },
    { grade:"Grade 6", q:"How do I check a key press?",                    kw:["key press","keyboard","detect","event","scratch"] },
    { grade:"Grade 7", q:"How do I show a variable on screen?",            kw:["show","display","variable","stage","scratch"] },
    { grade:"Grade 8", q:"Why do we use custom blocks?",                   kw:["custom block","why","reuse","organise","scratch"] },
    { grade:"Grade 9", q:"How do I delete a clone?",                       kw:["delete","clone","remove","scratch","clean"] },
    { grade:"Grade 10", q:"How do I write a comment in Python?",           kw:["comment","hash","#","explain","python"] },
    { grade:"Grade 11", q:"How do I call a function in Python?",           kw:["call","invoke","function","use","python"] },
    { grade:"Grade 12", q:"What is a Python package?",                     kw:["package","pip","folder","module","python"] },
    { grade:"Grade 5", q:"When would you use a loop in Scratch?",          kw:["loop","when","use","repeat","scratch"] },
    { grade:"Grade 6", q:"Give an example of a condition in Scratch.",     kw:["condition","example","if","touching","scratch"] },
    { grade:"Grade 7", q:"What is the difference between local and global variables?", kw:["local","global","variable","scope","scratch"] },
    { grade:"Grade 8", q:"How do custom blocks help organise a project?",  kw:["organise","organize","custom","project","scratch"] },
    { grade:"Grade 9", q:"What is the difference between a variable and a list?", kw:["variable","list","difference","single","multiple"] },
    { grade:"Grade 10", q:"What is a variable in Python?",                 kw:["variable","assign","store","python","value"] },
    { grade:"Grade 11", q:"What is the def keyword?",                      kw:["def","keyword","function","python","define"] },
    { grade:"Grade 12", q:"How do I build a small Python project?",        kw:["project","build","python","program","steps"] },
    { grade:"Grade 4", q:"What is a trigger in Scratch?",                  kw:["trigger","event","when","start","scratch"] },
  ],
};

// ─── Grade-aware chip queue ───────────────────────────────────────────────────
const GRADE_ORDER = [
  "Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6",
  "Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12",
];

const _chipQueue = {};

function buildQueue(subject, grade) {
  const key = `${subject}-${grade}`;
  const pool = SUBJECT_QUESTIONS[subject];
  if (!pool) { _chipQueue[key] = []; return; }

  // Grade-matched questions first (shuffled), then nearby grades in rings
  const gradeItems = [...pool.filter(q => q.grade === grade)].sort(() => Math.random() - 0.5);
  const gradeIdx = GRADE_ORDER.indexOf(grade);
  const extra = [];
  for (let offset = 1; offset < GRADE_ORDER.length; offset++) {
    [GRADE_ORDER[gradeIdx - offset], GRADE_ORDER[gradeIdx + offset]].forEach(g => {
      if (g) pool.filter(q => q.grade === g).sort(() => Math.random() - 0.5).forEach(q => extra.push(q));
    });
  }
  _chipQueue[key] = [...gradeItems, ...extra];
}

export function getTopicChips(subject, grade) {
  const key = `${subject}-${grade}`;
  const pool = SUBJECT_QUESTIONS[subject];
  // For custom subject, return generic chips
  if (!pool) return ["Explain this topic to me", "Give me an example", "Give me a practice question"];

  if (!_chipQueue[key] || _chipQueue[key].length < 2) buildQueue(subject, grade);
  const picked = _chipQueue[key].splice(0, 2).map(item => item.q);
  return [...picked, "Give me a practice question"];
}

export function generateDynamicChips(userMessage, subject, grade, defaultChips) {
  const pool = SUBJECT_QUESTIONS[subject];
  if (!pool) return defaultChips || getTopicChips(subject, grade);

  const msg = userMessage.toLowerCase();
  const key = `${subject}-${grade}`;

  // Prefer grade-matched items for scoring
  const gradePool = pool.filter(q => q.grade === grade);
  const searchPool = gradePool.length >= 4 ? gradePool : pool;

  const scored = searchPool.map(item => ({
    ...item,
    score: item.kw.reduce((acc, kw) => acc + (msg.includes(kw) ? 1 : 0), 0),
  }));

  scored.sort((a, b) => b.score - a.score || Math.random() - 0.5);

  if ((scored[0]?.score ?? 0) === 0) return getTopicChips(subject, grade);

  const picked = scored.slice(0, 2).map(x => x.q);
  if (_chipQueue[key]) _chipQueue[key] = _chipQueue[key].filter(item => !picked.includes(item.q));

  return [...picked, "Give me a practice question"];
}

// ─── Curriculum topics per subject per grade ──────────────────────────────────
export const CURRICULUM = {
  mathematics: {
    "Grade 1":"Counting & Shapes","Grade 2":"Addition & Subtraction",
    "Grade 3":"Multiplication & Fractions","Grade 4":"Decimals & Percentages",
    "Grade 5":"Ratios & Integers","Grade 6":"Algebra Intro",
    "Grade 7":"Linear Equations & Geometry","Grade 8":"Quadratics & Statistics",
    "Grade 9":"Trigonometry & Functions","Grade 10":"Logarithms & Calculus Intro",
    "Grade 11":"Calculus & Matrices","Grade 12":"Advanced Calculus & Vectors",
  },
  science: {
    "Grade 1":"Living Things & Nature","Grade 2":"States of Matter",
    "Grade 3":"Plants & Food Chains","Grade 4":"Atoms & Forces",
    "Grade 5":"Energy & Electricity","Grade 6":"Reactions & Cells",
    "Grade 7":"Newton's Laws & Genetics","Grade 8":"Acids & Cell Biology",
    "Grade 9":"Electricity & Evolution","Grade 10":"Waves & The Mole",
    "Grade 11":"Quantum & Thermodynamics","Grade 12":"Relativity & Nuclear Physics",
  },
  english: {
    "Grade 1":"Nouns, Verbs & Sounds","Grade 2":"Sentences & Rhymes",
    "Grade 3":"Paragraphs & Punctuation","Grade 4":"Fiction vs Non-Fiction",
    "Grade 5":"Figurative Language","Grade 6":"Grammar & Pronouns",
    "Grade 7":"Essay Writing","Grade 8":"Literary Devices",
    "Grade 9":"Character & Thesis","Grade 10":"Poetry & Analysis",
    "Grade 11":"Advanced Literature","Grade 12":"Literary Theory",
  },
  history: {
    "Grade 1":"Community & Helpers","Grade 2":"Maps & Communities",
    "Grade 3":"Ancient Civilisations","Grade 4":"Rome & Trade Routes",
    "Grade 5":"Revolutions & Wars","Grade 6":"Cold War & Modern History",
    "Grade 7":"Colonialism & Revolutions","Grade 8":"World Wars",
    "Grade 9":"20th Century Conflicts","Grade 10":"Decolonisation & Democracy",
    "Grade 11":"Cold War & Independence","Grade 12":"Globalisation & Human Rights",
  },
  cs: {
    "Grade 3":"Sequences & Patterns","Grade 4":"Loops & Repetition",
    "Grade 5":"Conditionals","Grade 6":"Variables & Data",
    "Grade 7":"Functions","Grade 8":"Lists & Arrays",
    "Grade 9":"Intro to OOP","Grade 10":"Recursion",
    "Grade 11":"Sorting & Searching","Grade 12":"Data Structures",
    "Grade 1":"Intro to Computers","Grade 2":"Basic Logic",
  },
  ai: {
    "Grade 3":"What is AI?","Grade 4":"Computers & Learning",
    "Grade 5":"Pattern Recognition","Grade 6":"Machine Learning Basics",
    "Grade 7":"Neural Networks","Grade 8":"AI Training & Data",
    "Grade 9":"Supervised Learning","Grade 10":"Unsupervised Learning",
    "Grade 11":"NLP & Computer Vision","Grade 12":"AI Ethics & Deep Learning",
    "Grade 1":"Intro to AI","Grade 2":"How Computers Help Us",
  },
  webdev: {
    "Grade 3":"What is the Internet?","Grade 4":"HTML Basics",
    "Grade 5":"More HTML","Grade 6":"CSS Styling",
    "Grade 7":"CSS Layouts","Grade 8":"JavaScript Basics",
    "Grade 9":"JavaScript & DOM","Grade 10":"Responsive Design",
    "Grade 11":"APIs & Fetch","Grade 12":"React & Frameworks",
    "Grade 1":"Exploring the Web","Grade 2":"How Websites Work",
  },
  blocks: {
    "Grade 3":"Scratch Basics","Grade 4":"Events & Actions",
    "Grade 5":"Loops in Blocks","Grade 6":"Conditionals in Blocks",
    "Grade 7":"Variables in Blocks","Grade 8":"Functions & My Blocks",
    "Grade 9":"Advanced Scratch","Grade 10":"Intro to Python",
    "Grade 11":"Python Functions","Grade 12":"Python Projects",
    "Grade 1":"Intro to Block Coding","Grade 2":"Simple Sequences",
  },
  custom: Object.fromEntries(GRADE_ORDER.map(g => [g, "Your Chosen Topic"])),
};

export function getCurriculumTopic(subject, grade) {
  return CURRICULUM[subject]?.[grade] || "Custom Topic";
}

// ─── Grade × Subject Topic Lists ─────────────────────────────────────────────
// 8 subjects × 12 grades × 8-10 topics each.
// Used by the topic selector UI — chips for Grade 1-3, dropdown for Grade 4-12.
export const GRADE_TOPICS = {
  mathematics: {
    'Grade 1':  ['Counting 1–20','Addition to 10','Subtraction Basics','2D Shapes','Patterns','Telling Time (Hour)','Sorting & Grouping','Measurement: Tall vs Short'],
    'Grade 2':  ['2-Digit Addition','2-Digit Subtraction','Place Value to 100','Money & Coins','Fractions (Halves & Quarters)','Telling Time (Half Hour)','Even & Odd Numbers','Basic Graphs'],
    'Grade 3':  ['Multiplication Tables','Division Basics','Fractions','Area & Perimeter','Rounding Numbers','Telling Time to the Minute','Data & Graphs','Multi-Step Word Problems'],
    'Grade 4':  ['Long Multiplication','Long Division','Decimals','Adding & Subtracting Fractions','Angles & Lines','Factors & Multiples','Mean, Median, Mode','Area of Rectangles'],
    'Grade 5':  ['Order of Operations (BODMAS)','Fractions: All Operations','Decimals: All Operations','Ratios & Rates','Introduction to Variables','Volume of 3D Shapes','Coordinate Planes','Percentages'],
    'Grade 6':  ['Ratios & Proportions','Integers: Positive & Negative','Algebraic Expressions','Solving One-Step Equations','Area of Triangles & Quadrilaterals','Probability Introduction','Statistics & Data','GCF & LCM'],
    'Grade 7':  ['Linear Equations','Inequalities','Percent & Discount','Proportional Relationships','Surface Area & Volume','Geometric Transformations','Probability','Rational Numbers'],
    'Grade 8':  ['Systems of Equations','Pythagorean Theorem','Quadratic Expressions','Functions & Relations','Exponents & Scientific Notation','Slope & Linear Functions','Statistics: Scatter Plots','Irrational Numbers'],
    'Grade 9':  ['Quadratic Equations','Polynomials','Trigonometry Introduction','Geometric Proofs','Exponential Functions','Probability & Statistics','Sequences & Series','Complex Numbers'],
    'Grade 10': ['Trigonometry: Sin, Cos, Tan','Logarithms','Conic Sections','Quadratic Functions','Probability & Combinations','Normal Distribution','Matrices','Sequences & Series'],
    'Grade 11': ['Calculus: Limits','Derivatives','Vectors','Matrices & Determinants','Trigonometric Identities','Logarithmic & Exponential Functions','Permutations & Combinations','Introduction to Statistics'],
    'Grade 12': ['Integration & Integrals','Differential Equations','Advanced Statistics','Linear Algebra','Multivariable Calculus','Probability Distributions','Series & Convergence','Mathematical Modelling'],
  },
  science: {
    'Grade 1':  ['Living vs Non-Living Things','Plants Around Us','Animal Habitats','Weather & Seasons','My Five Senses','Day & Night','Water: Liquid & Ice','Caring for the Earth'],
    'Grade 2':  ['Life Cycles','Solids, Liquids & Gases','Rocks & Soil','Weather Patterns','Properties of Matter','Ecosystems: Who Eats Whom','Animal Adaptations','Earth Materials'],
    'Grade 3':  ['Food Chains & Webs','Magnetism & Electricity','Plant Life Cycle','Fossils & Extinction','Gravity & Friction','Light & Sound Energy','Earth\'s Resources','Weather & Climate'],
    'Grade 4':  ['Ecosystems & Energy Flow','Static Electricity','Rocks & the Rock Cycle','Plate Tectonics','Sound Waves','Plant & Animal Cells Intro','Water Cycle','Simple Machines'],
    'Grade 5':  ['Photosynthesis','The Solar System','Physical vs Chemical Changes','Mixtures & Solutions','Ecosystems & Human Impact','Gravity & Orbital Motion','Adaptations & Evolution','Earth\'s Layers'],
    'Grade 6':  ['Cell Structure & Function','Earth\'s Layers & Plate Tectonics','Force, Motion & Newton\'s Laws','Weather Systems','Energy Types & Transformation','Introduction to Chemistry','Volcanoes & Earthquakes','Genetics Introduction'],
    'Grade 7':  ['Human Body Systems','Chemical Reactions','Genetics & Heredity','Evolution & Natural Selection','Waves: Light & Sound','The Periodic Table','Cell Division: Mitosis','Astronomy: Stars & Galaxies'],
    'Grade 8':  ['Genetics & DNA','Newton\'s Laws of Motion','Electricity & Circuits','Chemical Bonding','Natural Selection','Earth\'s History & Fossils','Acids & Bases','Energy Conservation'],
    'Grade 9':  ['Atomic Structure','Natural Selection & Evolution','Types of Energy','Ecology Introduction','Chemical Reactions','DNA Structure & Replication','Motion, Speed & Velocity','Periodic Table & Elements'],
    'Grade 10': ['Photosynthesis & Cellular Respiration','Plate Tectonics & Earthquakes','Acids, Bases & pH','Genetics: Mendel\'s Laws','Chemical Bonding','Waves: Light & Electromagnetic','Periodic Trends','Evolution Evidence'],
    'Grade 11': ['Thermodynamics','Organic Chemistry','Genetics & Biotechnology','Ecological Systems','Quantum Mechanics Introduction','Nuclear Physics','Electrochemistry','Human Physiology'],
    'Grade 12': ['Theory of Relativity','Nuclear Chemistry','Advanced Genetics & Genomics','Climate Science','Astrophysics','Biochemistry','Environmental Science','Particle Physics'],
  },
  english: {
    'Grade 1':  ['Nouns & Verbs','Phonics & Letter Sounds','Sight Words','Simple Sentences','Rhyming Words','Reading Comprehension','Uppercase & Lowercase','Story Sequence'],
    'Grade 2':  ['Adjectives & Adverbs','Sentence Structure','Punctuation Basics','Reading Stories','Simple Paragraphs','Synonyms & Antonyms','Compound Words','Story Elements'],
    'Grade 3':  ['Parts of Speech','Paragraphs & Topic Sentences','Commas & Apostrophes','Fiction vs Non-Fiction','Main Idea & Details','Prefixes & Suffixes','Writing Narratives','Poetry: Rhyme & Rhythm'],
    'Grade 4':  ['Grammar: Tenses','Essay Structure','Simile & Metaphor','Cause & Effect','Point of View','Vocabulary Building','Informative Writing','Character Analysis'],
    'Grade 5':  ['Advanced Grammar','Five-Paragraph Essays','Figurative Language','Theme & Central Idea','Persuasive Writing','Literary Devices','Research Writing','Dialogue & Quotes'],
    'Grade 6':  ['Pronouns & Agreement','Argumentative Writing','Text Evidence & Citing','Plot Structure','Connotation & Denotation','Formal vs Informal Writing','Reading: Inference','Tone & Mood'],
    'Grade 7':  ['Advanced Essay Writing','Literary Devices: All','Drama & Poetry','Author\'s Purpose & Bias','Sentence Variety','Research & Citations','Reading Complex Texts','Descriptive Writing'],
    'Grade 8':  ['Literary Analysis','Argumentative Essays','Rhetorical Devices','Allusion & Symbolism','Complex Sentence Structure','Media Literacy','Classic Literature','Speech Writing'],
    'Grade 9':  ['Character & Theme Analysis','Thesis Development','Research Papers','Shakespeare Introduction','Narrative Voice','Advanced Rhetoric','Novel Study','Critical Reading'],
    'Grade 10': ['Poetry Analysis','Advanced Literary Analysis','Comparative Essays','World Literature','Complex Themes','Speech & Debate','Advanced Research','Satire & Irony'],
    'Grade 11': ['AP Literature Techniques','Philosophical Essays','Modernist Literature','Advanced Rhetoric','Extended Essays','Postmodern Texts','Cultural Context in Literature','Critical Theory'],
    'Grade 12': ['Literary Theory','Postcolonial Literature','Feminist Criticism','College Essay Writing','Academic Discourse','Film & Literature','Canonical Works Analysis','Independent Literary Study'],
  },
  history: {
    'Grade 1':  ['My Community & Helpers','Rules & Laws','Symbols of My Country','Maps & Directions','Past vs Present','Community Leaders','Holidays & Traditions','Family History'],
    'Grade 2':  ['Maps & Continents','Famous Explorers','World Regions','Indigenous Peoples','How Communities Change','Heroes & Leaders','Trade & Exchange','Ancient Cultures'],
    'Grade 3':  ['Ancient Civilisations','Egypt & Mesopotamia','Ancient Greece','Ancient Rome','Indigenous Cultures','Timelines & History','World Religions Introduction','Geography & Climate'],
    'Grade 4':  ['The Roman Empire','Medieval Europe','The Silk Road','Ancient China & India','African Kingdoms','Knights & Castles','Trade Routes','The Crusades'],
    'Grade 5':  ['Age of Exploration','The Renaissance','European Colonisation','The Reformation','American Revolution','French Revolution','Slavery & Abolition','Industrial Revolution'],
    'Grade 6':  ['World War I','Russian Revolution','The Great Depression','World War II','The Holocaust','Independence Movements','Cold War Origins','United Nations & Human Rights'],
    'Grade 7':  ['Colonialism in Africa & Asia','American Civil War','Latin American Independence','The Scramble for Africa','WWI Causes & Effects','Rise of Fascism','Great Depression','Revolutions'],
    'Grade 8':  ['World War II in Detail','The Holocaust','Cold War','Korean War','Civil Rights Movement','Space Race','Vietnam War','Decolonisation of Africa'],
    'Grade 9':  ['Cold War Conflicts','Apartheid','Vietnam War & Protests','The Berlin Wall','Cuban Missile Crisis','Palestinian Conflict','Fall of the Soviet Union','Genocide Studies'],
    'Grade 10': ['Decolonisation & Independence','Civil Rights Movement in Depth','Women\'s Suffrage','Capitalism vs Communism','Arab-Israeli Conflict','Environmental History','Economic Globalisation','Nuclear Age'],
    'Grade 11': ['Cold War & Proxy Wars','Post-Colonial Africa','Modern Middle East','The United Nations','Human Rights History','Technology & Society','Economic Crises','Environmental Movements'],
    'Grade 12': ['Globalisation','21st Century Conflicts','Climate & History','Digital Revolution','Rise of China','Democracy & Authoritarianism','Refugee Crisis','Future of History'],
  },
  cs: {
    'Grade 1':  ['What is a Computer?','Using a Mouse & Keyboard','Internet Safety','Basic Typing','Sequencing Steps','Digital Devices','Online vs Offline','My Digital Footprint'],
    'Grade 2':  ['Basic Logic Puzzles','Simple Sequences','Inputs & Outputs','Algorithms in Real Life','Debugging: Finding Mistakes','Binary Numbers Introduction','Computer Parts','Creating Digital Art'],
    'Grade 3':  ['Sequences & Algorithms','Loops Introduction','Conditionals: If-Then','Scratch Basics','Computer Networks','File Management','Binary: 0 and 1','Data: Collecting & Organising'],
    'Grade 4':  ['Loops & Repetition','Nested Loops','Conditionals in Scratch','Variables Introduction','Events & Triggers','Debugging Strategies','Creating Games in Scratch','Boolean Logic'],
    'Grade 5':  ['Conditionals: If-Else','Variables & Data Types','Functions: Reusable Code','Lists & Arrays','Sorting Algorithms','Python Introduction','Cybersecurity Basics','Computational Thinking'],
    'Grade 6':  ['Variables & Data in Python','Functions in Python','Loops in Python','String Manipulation','Lists in Python','File Input & Output','Debugging in Python','Algorithm Efficiency'],
    'Grade 7':  ['Functions & Parameters','Return Values','Dictionaries in Python','Error Handling','OOP Introduction','Modules & Libraries','Basic Data Structures','Web Scraping Basics'],
    'Grade 8':  ['Object-Oriented Programming','Classes & Objects','Inheritance','Recursion','Sorting Algorithms','Big O Notation','Databases & SQL','APIs & HTTP'],
    'Grade 9':  ['OOP: Advanced Patterns','Recursion & Problem Solving','Trees & Graphs','Sorting & Searching Algorithms','Database Design','Software Development Life Cycle','Cybersecurity','Operating Systems'],
    'Grade 10': ['Data Structures: Stacks & Queues','Graph Algorithms','Dynamic Programming','SQL Queries','Network Protocols','Encryption & Security','Machine Learning Overview','Software Engineering'],
    'Grade 11': ['Advanced Algorithms','Computational Complexity','Artificial Intelligence','Compilers & Interpreters','Distributed Systems','Cloud Computing','Ethical Hacking','Systems Programming'],
    'Grade 12': ['Data Structures: Advanced','Algorithm Design Patterns','Computer Architecture','OS Design','Blockchain Basics','Quantum Computing','AI & Deep Learning','Research & Innovation'],
  },
  ai: {
    'Grade 1':  ['What is AI?','Robots & Helpers','Computers That Think','AI in Everyday Life','Voice Assistants','Smart Toys','How Apps Learn','Teaching Computers'],
    'Grade 2':  ['How Computers Help Us','Pattern Spotting','Smart Phones & AI','AI Assistants','Recommendation Systems','Face Recognition Basics','AI in Games','Responsible AI'],
    'Grade 3':  ['What is Machine Learning?','Pattern Recognition','Training a Computer','AI Ethics: Is it Fair?','Self-Driving Cars','AI in Healthcare','Image Recognition','Chatbots'],
    'Grade 4':  ['Computers & Learning','Training Data','Decision Trees','AI Bias & Fairness','AI in Sports','Natural Language Processing','AI & Creativity','Supervised Learning'],
    'Grade 5':  ['Pattern Recognition Deep Dive','Classification Problems','Datasets & Features','Overfitting & Underfitting','AI in Agriculture','AI Art & Music','Ethics of AI','Unsupervised Learning'],
    'Grade 6':  ['Machine Learning Basics','Types of ML: Supervised/Unsupervised','Regression vs Classification','Neural Network Introduction','Feature Engineering','AI Applications','Data Bias','Reinforcement Learning'],
    'Grade 7':  ['Neural Networks in Depth','Layers & Weights','Backpropagation Concept','Training vs Testing Data','Convolutional Neural Networks','AI Ethics Framework','NLP Introduction','Computer Vision'],
    'Grade 8':  ['AI Training & Data Pipeline','Deep Learning Introduction','Sentiment Analysis','Transfer Learning','AI in Medicine','Generative AI','Large Language Models','AI Safety'],
    'Grade 9':  ['Supervised Learning Algorithms','Decision Trees & Random Forests','Support Vector Machines','K-Nearest Neighbours','Model Evaluation Metrics','Cross-Validation','Feature Selection','AI in Finance'],
    'Grade 10': ['Unsupervised Learning','Clustering: K-Means','PCA & Dimensionality Reduction','Recommendation Systems','GANs: Generative Models','Transformer Architecture','AI in Climate Science','AI Governance'],
    'Grade 11': ['NLP & Computer Vision Advanced','Attention Mechanisms','BERT & GPT Architecture','Reinforcement Learning: Q-Learning','AI Research Methods','AI in Robotics','Federated Learning','Explainable AI'],
    'Grade 12': ['AI Ethics & Deep Learning','AI Policy & Regulation','Cutting-Edge Research','AI Startups & Industry','Multimodal AI','AI Safety & Alignment','Future of AI','Building AI Applications'],
  },
  webdev: {
    'Grade 1':  ['What is the Internet?','Websites We Use','Safe Browsing','Typing Practice','Clicking & Navigating','Email Basics','Online vs Offline','Digital Safety Rules'],
    'Grade 2':  ['How Websites Work','Web Browsers','URLs & Links','Searching Safely Online','Creating Digital Content','Online Privacy','Web Images & Copyright','Sharing Online'],
    'Grade 3':  ['What Makes a Website?','HTML Introduction','Web Page Structure','Hyperlinks','Images on Web','Web Design Basics','Accessibility on the Web','Creating a Simple Page'],
    'Grade 4':  ['HTML: Tags & Elements','Headings & Paragraphs','Lists in HTML','Links & Anchors','Images in HTML','Tables Basics','HTML Forms','Building My First Webpage'],
    'Grade 5':  ['Semantic HTML Tags','CSS Introduction','Colors & Backgrounds','CSS Text Styling','Box Model Basics','CSS Classes & IDs','Simple Layouts','Responsive Design Introduction'],
    'Grade 6':  ['CSS Styling Deep Dive','Flexbox Basics','CSS Grid Introduction','Animations & Transitions','Web Fonts','CSS Variables','Mobile-First Design','Building a Portfolio Page'],
    'Grade 7':  ['CSS Layouts: Flexbox & Grid','JavaScript Introduction','Variables in JavaScript','If-Else in JavaScript','JavaScript Loops','Functions in JavaScript','DOM Basics','Event Listeners'],
    'Grade 8':  ['DOM Manipulation','Events & Interactivity','Forms & Validation','Arrays & Objects in JS','Fetch API Basics','JSON Data','Building Interactive Pages','Debugging JavaScript'],
    'Grade 9':  ['Asynchronous JavaScript','Promises & Async/Await','REST APIs','Local Storage','Error Handling','Version Control: Git','Full Project Build','Node.js Introduction'],
    'Grade 10': ['Responsive Design Advanced','CSS Frameworks: Bootstrap','JavaScript ES6+','Vite & Module Bundlers','Express Server Basics','Database: MongoDB Intro','Deployment: Netlify/Vercel','Web Security Basics'],
    'Grade 11': ['React Introduction','Components & Props','State Management','React Router','Authentication Basics','Testing Web Apps','Performance Optimisation','APIs: Advanced'],
    'Grade 12': ['Next.js & Full Stack','GraphQL','Microservices','DevOps Basics','Cloud Hosting (AWS/GCP)','Advanced Web Security','Open Source Contribution','Capstone Project'],
  },
  blocks: {
    'Grade 1':  ['What is Coding?','My First Block Program','Sequences of Actions','Moving a Sprite','Sounds & Music Blocks','Backgrounds & Costumes','Simple Story in Scratch','Debugging My Program'],
    'Grade 2':  ['Simple Sequences','Events: When Flag Clicked','Motion Blocks','Looks Blocks','Sound Blocks','Drawing with Scratch','Animated Stories','Basic Debugging'],
    'Grade 3':  ['Loops: Repeat Block','Wait & Timing','Forever Loops','Bouncing Ball','Simple Maze Game','Sprite Costumes Animation','Multiple Sprites','Scratch Basics Review'],
    'Grade 4':  ['Events & Actions','Broadcast Messages','Conditionals: If Block','Sensing: Touch & Key','Score Counter Variable','Creating a Quiz Game','Cloning Sprites','Custom Backgrounds'],
    'Grade 5':  ['Loops in Blocks Advanced','Nested Loops','Variables: Tracking Data','Making a Platform Game','Lists in Scratch','String Operations','Sharing Projects','Debugging Complex Programs'],
    'Grade 6':  ['Boolean Logic in Blocks','Complex Sensing','Timer & Score Systems','Creating Animations','Recursive Patterns','Data in Scratch','Full Game Design','User Interface in Scratch'],
    'Grade 7':  ['Custom Blocks (Functions)','Arguments & Inputs','Complex Games','Sprite Interaction','Physics Simulations','Music & Art Programs','Collaborative Projects','Variables Advanced'],
    'Grade 8':  ['Functions & My Blocks','Recursion in Blocks','AI in Scratch (ML4Kids)','Machine Learning Blocks','Data Visualisation','Large Project Design','Code Documentation','Complex Algorithms'],
    'Grade 9':  ['Python from Scratch: Variables','Python: Loops & Conditionals','Python: Functions','Comparing Block & Text Code','Debugging in Python','Mini Games in Python','Transition to Text Coding','Advanced Scratch Projects'],
    'Grade 10': ['Python Introduction Full','Turtle Graphics in Python','Python: Lists & Dictionaries','File Handling in Python','OOP in Python Intro','Python Libraries','Data Analysis Basics','Building a Python App'],
    'Grade 11': ['Python Functions Advanced','Python OOP','Modules & Packages','GUI with Tkinter','Python for Data Science','API Calls in Python','Automation Scripts','Open Source Projects'],
    'Grade 12': ['Web Apps with Flask','Data Science: Pandas','Machine Learning with sklearn','Final Capstone Project','Code Review & Best Practices','Publishing Projects','Tech Career Pathways','Python Projects: Full Apps'],
  },
  custom: Object.fromEntries(
    ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"]
      .map(g => [g, ["Ask me anything! I'll teach you about whatever topic you choose."]])
  ),
};

export const CONFUSION_PATTERNS = [
  /i don'?t (get|understand)/i,
  /explain (differently|again|more)/i,
  /what does that mean/i,
  /i'?m confused/i,
  /still don'?t understand/i,
  /can you re-?explain/i,
  /huh\?/i,
];

export function detectRequestType(message) {
  if (/practice (question|problem)|quiz me|test me|give me a (question|problem)|give me a practice|practice question/i.test(message)) return "practice";
  if (/what is|what are|explain|how does|how do|why is|why does|define|tell me about|what was|what were/i.test(message)) return "concept";
  return "general";
}

export function isConfused(message) {
  return CONFUSION_PATTERNS.some(p => p.test(message));
}

// ─── Practice Questions ───────────────────────────────────────────────────────
export const PRACTICE_QUESTIONS = {
  mathematics: {
    "Grade 3": [{ q:"What is 7 × 8?", a:"56" }],
    "Grade 4": [{ q:"What is 25% of 200?", a:"50" }],
    "Grade 5": [{ q:"What is the order of operations? Solve: 2 + 3 × 4", a:"The order is BODMAS/PEMDAS; multiplication first: 2 + 12 = 14" }],
    "Grade 6": [{ q:"Solve: 2x + 3 = 11", a:"x = 4" }],
    "Grade 7": [{ q:"What is the Pythagorean theorem? If a=3, b=4, what is c?", a:"c² = a² + b² so c = 5" }],
    "Grade 8": [{ q:"What are the roots of x² - 5x + 6 = 0?", a:"x = 2 and x = 3" }],
    "Grade 9": [{ q:"What is sin(90°)?", a:"sin(90°) = 1" }],
    "Grade 10": [{ q:"What is log₁₀(1000)?", a:"log₁₀(1000) = 3" }],
    "Grade 11": [{ q:"What is the integral of 2x?", a:"x² + C" }],
    "Grade 12": [{ q:"What is the derivative of x³?", a:"3x²" }],
  },
  science: {
    "Grade 3": [{ q:"What do plants need for photosynthesis?", a:"Sunlight, water, and carbon dioxide" }],
    "Grade 4": [{ q:"What are the three states of matter?", a:"Solid, liquid, and gas" }],
    "Grade 5": [{ q:"What is the formula for speed?", a:"Speed = Distance ÷ Time" }],
    "Grade 6": [{ q:"What is the basic unit of life?", a:"The cell" }],
    "Grade 7": [{ q:"State Newton's first law of motion.", a:"An object stays at rest or in motion unless acted on by a force" }],
    "Grade 8": [{ q:"What is the pH of a neutral substance?", a:"pH 7" }],
    "Grade 9": [{ q:"State Ohm's Law.", a:"V = IR (Voltage = Current × Resistance)" }],
    "Grade 10": [{ q:"What is the speed of light?", a:"Approximately 3 × 10⁸ m/s" }],
    "Grade 11": [{ q:"What does the first law of thermodynamics state?", a:"Energy cannot be created or destroyed, only transferred or transformed" }],
    "Grade 12": [{ q:"What is nuclear fission?", a:"Splitting a heavy atomic nucleus into smaller nuclei, releasing large amounts of energy" }],
  },
  english: {
    "Grade 3": [{ q:"Give an example of a noun and a verb.", a:"Noun: dog, verb: runs" }],
    "Grade 4": [{ q:"What is a simile? Give an example.", a:"A simile compares two things using 'like' or 'as'. Example: as fast as a cheetah" }],
    "Grade 5": [{ q:"What is a metaphor? Give an example.", a:"A metaphor says something is something else. Example: life is a journey" }],
    "Grade 6": [{ q:"What is the difference between active and passive voice?", a:"Active: subject does the action. Passive: subject receives the action" }],
    "Grade 7": [{ q:"What are the three parts of an essay?", a:"Introduction, body paragraphs, and conclusion" }],
    "Grade 8": [{ q:"What is alliteration? Give an example.", a:"Repetition of the same consonant sound at the start of words. Example: Peter Piper picked" }],
    "Grade 9": [{ q:"What is a thesis statement?", a:"A thesis statement is the main argument of an essay, usually in the introduction" }],
    "Grade 10": [{ q:"How many lines does a sonnet have?", a:"14 lines" }],
    "Grade 11": [{ q:"What is an unreliable narrator?", a:"A narrator whose credibility is compromised, making the reader question the story" }],
    "Grade 12": [{ q:"What is intertextuality?", a:"When a text references or connects to another text, creating layers of meaning" }],
  },
  history: {
    "Grade 3": [{ q:"Name one ancient civilisation.", a:"Ancient Egypt, Greece, Rome, or Mesopotamia" }],
    "Grade 5": [{ q:"In what year did World War I begin?", a:"1914" }],
    "Grade 6": [{ q:"What was the Cold War?", a:"A period of political and military tension between the USA and USSR after World War II" }],
    "Grade 7": [{ q:"What did colonialism mean for Africa and Asia?", a:"European powers took control of African and Asian lands, exploiting their resources and people" }],
    "Grade 8": [{ q:"In what year did World War II end?", a:"1945" }],
    "Grade 9": [{ q:"Who led the Russian Revolution?", a:"Vladimir Lenin led the Bolshevik revolution in 1917" }],
    "Grade 10": [{ q:"What was decolonisation?", a:"The process by which colonies gained independence from European empires, mainly after World War II" }],
    "Grade 11": [{ q:"What was the Cuban Missile Crisis?", a:"A 1962 standoff between the USA and USSR over Soviet missiles in Cuba" }],
    "Grade 12": [{ q:"What were the Nuremberg Trials?", a:"Post-WWII trials where Nazi leaders were prosecuted for war crimes and crimes against humanity" }],
  },
  cs: {
    "Grade 3": [{ q:"What is an algorithm?", a:"A set of step-by-step instructions to solve a problem" }],
    "Grade 4": [{ q:"What is a loop in programming?", a:"A loop repeats a block of instructions multiple times automatically" }],
    "Grade 5": [{ q:"What is a conditional statement?", a:"A conditional runs code only when a certain condition is true or false" }],
    "Grade 6": [{ q:"What is a variable?", a:"A named container that stores a value which can change during a program" }],
    "Grade 7": [{ q:"What is a function?", a:"A reusable named block of code that performs a specific task" }],
    "Grade 8": [{ q:"What is an array?", a:"An ordered collection of items stored at numbered index positions" }],
    "Grade 9": [{ q:"What is a class in OOP?", a:"A blueprint or template for creating objects with shared properties and methods" }],
    "Grade 10": [{ q:"What is recursion?", a:"When a function calls itself to solve smaller versions of the same problem" }],
    "Grade 11": [{ q:"How does binary search work?", a:"Binary search divides a sorted list in half repeatedly until the target value is found" }],
    "Grade 12": [{ q:"What is a linked list?", a:"A chain of nodes where each node stores data and points to the next node" }],
  },
  ai: {
    "Grade 3": [{ q:"What is artificial intelligence?", a:"Technology that lets computers do tasks that normally require human thinking" }],
    "Grade 4": [{ q:"What is training data?", a:"Examples a machine learning model learns from to make predictions" }],
    "Grade 5": [{ q:"What is pattern recognition?", a:"The ability of AI to identify regularities or features in data" }],
    "Grade 6": [{ q:"What is machine learning?", a:"A type of AI where computers learn from data instead of being explicitly programmed" }],
    "Grade 7": [{ q:"What is a neural network?", a:"A system of layers of connected nodes that learns patterns from data" }],
    "Grade 8": [{ q:"What is overfitting?", a:"When a model memorises training data so well it performs poorly on new data" }],
    "Grade 9": [{ q:"What is supervised learning?", a:"Training a model on labeled input-output pairs to predict future outputs" }],
    "Grade 10": [{ q:"What is K-means clustering?", a:"Groups data into K clusters by finding the nearest cluster centre for each point" }],
    "Grade 11": [{ q:"What is NLP?", a:"Natural Language Processing — AI that helps computers understand and generate human language" }],
    "Grade 12": [{ q:"What is AI bias?", a:"When a model produces unfair results due to biased training data" }],
  },
  webdev: {
    "Grade 3": [{ q:"What is a website?", a:"A collection of web pages accessible through a browser on the internet" }],
    "Grade 4": [{ q:"What is HTML?", a:"HyperText Markup Language — it structures the content of web pages" }],
    "Grade 5": [{ q:"What does the anchor tag do?", a:"Creates a clickable hyperlink that takes the user to another page or URL" }],
    "Grade 6": [{ q:"What is CSS?", a:"Cascading Style Sheets — controls the visual appearance of web pages" }],
    "Grade 7": [{ q:"What is flexbox?", a:"A CSS layout system that arranges items in a row or column and controls spacing" }],
    "Grade 8": [{ q:"What is JavaScript?", a:"A programming language that adds interactivity and dynamic behaviour to web pages" }],
    "Grade 9": [{ q:"What is the DOM?", a:"A tree structure representing the HTML of a page that JavaScript can read and modify" }],
    "Grade 10": [{ q:"What is responsive design?", a:"Making websites adapt to different screen sizes using flexible layouts" }],
    "Grade 11": [{ q:"What is an API?", a:"An interface that lets your code communicate with an external service or data source" }],
    "Grade 12": [{ q:"What is React?", a:"A JavaScript library for building fast interactive user interfaces using components" }],
  },
  blocks: {
    "Grade 3": [{ q:"What is Scratch?", a:"A free block-based visual programming platform for beginners created by MIT" }],
    "Grade 4": [{ q:"What is the green flag in Scratch?", a:"A button that starts your Scratch program when clicked" }],
    "Grade 5": [{ q:"What is a forever loop in Scratch?", a:"A loop that runs continuously without stopping until the program ends" }],
    "Grade 6": [{ q:"How do you use if-then in Scratch?", a:"The if-then block checks a condition and runs the blocks inside only when true" }],
    "Grade 7": [{ q:"How do you keep score in a Scratch game?", a:"Create a score variable then use 'change score by' block to add points" }],
    "Grade 8": [{ q:"What is a My Block?", a:"A custom reusable block you define yourself to organise your code" }],
    "Grade 9": [{ q:"What is cloning in Scratch?", a:"Creating copies of a sprite during the program that can move and act independently" }],
    "Grade 10": [{ q:"What is indentation in Python?", a:"Spaces used to show which lines of code belong inside a block like a loop or function" }],
    "Grade 11": [{ q:"How do you define a function in Python?", a:"Use the def keyword, function name, parentheses, a colon, then indent the body" }],
    "Grade 12": [{ q:"What is a module in Python?", a:"A file containing Python code that you can import and reuse in other programs" }],
  },
};

const _usedIdx = {};

export function getNextPracticeQuestion(subject, grade) {
  const subjectPool = PRACTICE_QUESTIONS[subject];
  if (!subjectPool) return null;

  let resolvedGrade = grade;
  if (!subjectPool[grade] || subjectPool[grade].length === 0) {
    const gradeIdx = GRADE_ORDER.indexOf(grade);
    let found = false;
    for (let offset = 1; offset < GRADE_ORDER.length; offset++) {
      const lower = GRADE_ORDER[gradeIdx - offset];
      const upper = GRADE_ORDER[gradeIdx + offset];
      if (lower && subjectPool[lower]?.length > 0) { resolvedGrade = lower; found = true; break; }
      if (upper && subjectPool[upper]?.length > 0) { resolvedGrade = upper; found = true; break; }
    }
    if (!found) return null;
  }

  const pool = subjectPool[resolvedGrade];
  const key = `${subject}-${resolvedGrade}`;
  if (!_usedIdx[key] || _usedIdx[key].length === 0) {
    _usedIdx[key] = [...Array(pool.length).keys()].sort(() => Math.random() - 0.5);
  }
  const idx = _usedIdx[key].pop();
  return pool[idx];
}
