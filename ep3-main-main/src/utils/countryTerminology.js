import global1 from "../pages/global1";

export const configureCountryTerminology = (country = "") => {
  const normalized = String(country || "").trim().toLowerCase();
  global1.defaultCountry = country || "";
  global1.studentLabel = normalized === "usa" || normalized === "united states" || normalized === "united states of america"
    ? "Resident"
    : "Student";
};

export const displayText = (value) => {
  if (value === null || value === undefined) return value;
  if (global1.studentLabel !== "Resident") return value;
  return String(value)
    .replace(/\bStudents\b/g, "Residents")
    .replace(/\bStudent\b/g, "Resident")
    .replace(/\bstudents\b/g, "residents")
    .replace(/\bstudent\b/g, "resident")
    .replace(/\bNEP\s+/g, "")
    .replace(/\bNEP\b/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "SELECT", "OPTION"]);

const rewriteTextNode = (node) => {
  const nextValue = displayText(node.nodeValue);
  if (nextValue !== node.nodeValue) {
    node.nodeValue = nextValue;
  }
};

const rewriteElementAttributes = (element) => {
  ["placeholder", "title", "aria-label"].forEach((attribute) => {
    const value = element.getAttribute?.(attribute);
    if (!value) return;
    const nextValue = displayText(value);
    if (nextValue !== value) element.setAttribute(attribute, nextValue);
  });
};

export const rewriteVisibleStudentLabels = (root = document.body) => {
  if (!root || global1.studentLabel !== "Resident") return;

  if (root.nodeType === Node.TEXT_NODE) {
    rewriteTextNode(root);
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE || SKIP_TAGS.has(root.tagName)) return;
  rewriteElementAttributes(root);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      if (node.nodeType === Node.ELEMENT_NODE && SKIP_TAGS.has(node.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let node = walker.currentNode;
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) rewriteTextNode(node);
    if (node.nodeType === Node.ELEMENT_NODE) rewriteElementAttributes(node);
    node = walker.nextNode();
  }
};

export const observeStudentLabelChanges = () => {
  if (typeof window === "undefined" || typeof MutationObserver === "undefined") return () => {};
  rewriteVisibleStudentLabels();
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => rewriteVisibleStudentLabels(node));
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
};
