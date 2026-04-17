import path from "node:path";

export type LibrarySource = {
  id: string;
  title: string;
  filePath: string;
  tags: string[];
};

const root = path.join(process.cwd(), "KI-Philosophie");

function source(id: string, fileName: string, title: string, tags: string[]): LibrarySource {
  return {
    id,
    title,
    filePath: path.join(root, fileName),
    tags
  };
}

export const libraryCatalog: LibrarySource[] = [
  source(
    "sep-deontology",
    "Deontological Ethics (Stanford Encyclopedia of Philosophy_Winter 2021 Edition).pdf",
    "Deontological Ethics (SEP)",
    ["deontology", "duty", "kant", "obligation", "promise", "truthfulness", "respect"]
  ),
  source(
    "sep-consequentialism",
    "Consequentialism (Stanford Encyclopedia of Philosophy_Winter 2023 Edition).pdf",
    "Consequentialism (SEP)",
    ["consequentialism", "utilitarianism", "outcomes", "tradeoffs", "harm", "welfare"]
  ),
  source(
    "sep-virtue-ethics",
    "Virtue Ethics (Stanford Encyclopedia of Philosophy_Fall 2023 Edition).pdf",
    "Virtue Ethics (SEP)",
    ["virtue ethics", "virtue", "aristotle", "character", "habit", "courage", "friendship"]
  ),
  source(
    "sep-adam-smith",
    "Adam Smith’s Moral and Political Philosophy (Stanford Encyclopedia of Philosophy).pdf",
    "Adam Smith's Moral and Political Philosophy (SEP)",
    ["adam smith", "sympathy", "moral sentiments", "commercial society", "justice", "virtue"]
  ),
  source(
    "sep-african-ethics",
    "African Ethics (Stanford Encyclopedia of Philosophy).pdf",
    "African Ethics (SEP)",
    ["african ethics", "ubuntu", "community", "personhood", "care", "reciprocity"]
  ),
  source(
    "sep-ayn-rand",
    "Ayn Rand (Stanford Encyclopedia of Philosophy).pdf",
    "Ayn Rand (SEP)",
    ["ayn rand", "egoism", "individualism", "self-interest", "capitalism"]
  ),
  source(
    "sep-nietzsche-aesthetics",
    "Nietzsche’s Aesthetics (Stanford Encyclopedia of Philosophy).pdf",
    "Nietzsche's Aesthetics (SEP)",
    ["nietzsche", "aesthetics", "value", "culture"]
  ),
  source(
    "sep-schopenhauer-aesthetics",
    "Schopenhauer’s Aesthetics (Stanford Encyclopedia of Philosophy).pdf",
    "Schopenhauer's Aesthetics (SEP)",
    ["schopenhauer", "aesthetics", "will", "suffering"]
  ),
  source(
    "moral-machine",
    "The Moral Machine Article 2018.pdf",
    "The Moral Machine Experiment",
    ["moral machine", "moral psychology", "autonomous vehicles", "tradeoffs", "fairness", "harm"]
  ),
  source(
    "bank-dishonesty",
    "Business culture and dishonesty in the banking industry. Nature, 516(7529),.pdf",
    "Business Culture and Dishonesty in the Banking Industry",
    ["dishonesty", "business ethics", "banking", "culture", "norms", "corruption", "incentives"]
  ),
  source(
    "benabou-social-responsibility",
    "Economica 2009 Benabou Social Responsibility.pdf",
    "Bénabou and Tirole on Individual and Corporate Social Responsibility",
    ["social responsibility", "motives", "signaling", "reputation", "business ethics"]
  ),
  source(
    "friedman-social-responsibility",
    "Friedman Social Responsibility 1970.pdf",
    "Friedman on the Social Responsibility of Business",
    ["friedman", "business ethics", "shareholder", "responsibility", "market"]
  ),
  source(
    "shared-value",
    "Creating Shared Value.pdf",
    "Creating Shared Value",
    ["shared value", "business ethics", "corporation", "stakeholders", "social responsibility"]
  ),
  source(
    "sandel-happiness",
    "Sandel The Greatest Happiness Principle.pdf",
    "Sandel on the Greatest Happiness Principle",
    ["sandel", "utilitarianism", "justice", "happiness", "price", "tradeoffs"]
  ),
  source(
    "sandel-motive",
    "What Matters is the Motive - Sandel 2010.pdf",
    "Sandel on Motive and Deontology",
    ["sandel", "motive", "kant", "deontology", "duty", "intentions"]
  ),
  source(
    "justice-mind-your-motive",
    "Justice Episode 06 Mind Your Motive.pdf",
    "Justice: Mind Your Motive",
    ["sandel", "motive", "kant", "deontology", "duty", "justice"]
  ),
  source(
    "justice-putting-price-on-life",
    "Harvard University. (2009, September 8). Justice_ What’s the right thing to do_ Episode 02_ “Putting a Price Tag on Life”.pdf",
    "Justice: Putting a Price Tag on Life",
    ["sandel", "price", "life", "utilitarianism", "fairness", "justice"]
  ),
  source(
    "justice-putting-price-on-life-alt",
    "Harvard University. (2009, September 8). Justice_ What’s the right thing to do_ Episode 02_ “Putting a Price Tag on Life” (1).pdf",
    "Justice: Putting a Price Tag on Life (Alt)",
    ["sandel", "price", "life", "utilitarianism", "fairness", "justice"]
  ),
  source(
    "justice-desert",
    "Who Deserves What in Justice.pdf",
    "Who Deserves What in Justice",
    ["desert", "justice", "fairness", "merit", "equality", "distribution"]
  ),
  source(
    "pieper-viergespann",
    "PIEPER_Viergespann.pdf",
    "Pieper on the Cardinal Virtues",
    ["pieper", "prudence", "justice", "fortitude", "temperance", "virtue"]
  ),
  source(
    "approach-ability-aftermath",
    "approach ability aftermath .pdf",
    "Approach, Ability, Aftermath",
    ["moral psychology", "behavior", "judgment", "action"]
  ),
  source(
    "paper-0011526042365555",
    "0011526042365555.pdf",
    "Library Paper 0011526042365555",
    ["moral psychology", "ethics", "behavior"]
  ),
  source(
    "paper-2001-18918-008",
    "2001-18918-008.pdf",
    "Library Paper 2001-18918-008",
    ["moral psychology", "ethics", "behavior"]
  )
];
