export const SAMPLE_TOPICS = [
  {
    topic: "AI and Cultural Memory",
    domain: "science/philosophy"
  },
  {
    topic: "Quiet Revolutions in the City: Small Designs for Urban Heat",
    domain: "urban design / climate"
  },
  {
    topic: "The Hidden Language of Mycelial Networks",
    domain: "biology / ecology"
  },
  {
    topic: "Forgotten Empires: Trade Routes Before the Silk Road",
    domain: "history / archaeology"
  },
  {
    topic: "Quantum Computing and the Future of Cryptography",
    domain: "technology / security"
  },
  {
    topic: "The Psychology of Decision Fatigue in Modern Life",
    domain: "psychology / neuroscience"
  },
  {
    topic: "Ocean Acidification and Marine Ecosystems",
    domain: "environmental science / marine biology"
  },
  {
    topic: "The Evolution of Human Language and Cognition",
    domain: "linguistics / anthropology"
  },
  {
    topic: "Renewable Energy Storage: Beyond Lithium Batteries",
    domain: "engineering / sustainability"
  },
  {
    topic: "The Impact of Social Media on Democratic Discourse",
    domain: "sociology / political science"
  },
  {
    topic: "Neuroplasticity and Learning in Adult Brains",
    domain: "neuroscience / education"
  },
  {
    topic: "Ancient Architectural Engineering Marvels",
    domain: "history / engineering"
  },
  {
    topic: "The Microbiome and Human Health",
    domain: "biology / medicine"
  },
  {
    topic: "Space Debris and Orbital Sustainability",
    domain: "aerospace / environmental science"
  },
  {
    topic: "The Philosophy of Artificial Consciousness",
    domain: "philosophy / AI ethics"
  },
  {
    topic: "Climate Migration and Urban Planning",
    domain: "geography / urban studies"
  },
  {
    topic: "The Economics of Attention in Digital Markets",
    domain: "economics / technology"
  },
  {
    topic: "Bioacoustics: How Animals Communicate Through Sound",
    domain: "zoology / acoustics"
  },
  {
    topic: "The Science of Sleep and Memory Consolidation",
    domain: "neuroscience / psychology"
  },
  {
    topic: "Carbon Capture Technology and Climate Solutions",
    domain: "environmental engineering / climate science"
  }
];

export function getRandomTopic() {
  const randomIndex = Math.floor(Math.random() * SAMPLE_TOPICS.length);
  return SAMPLE_TOPICS[randomIndex];
}


