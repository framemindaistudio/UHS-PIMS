/**
 * UHS-RIMS — Hand-verified PI name aliases
 * -----------------------------------------------------------
 * Some staff appear on projects under a differently-spelled name, so the
 * automatic surname+initials matcher on the Employees page cannot safely
 * link them (and must not guess). Each entry below has been CONFIRMED by
 * the DR office as the same person, so it is safe to link.
 *
 * Format:
 *   "<employee name, exactly as shown in the Employees list>": [
 *     "<PI spelling as it appears on projects>",
 *     "<another spelling>", ...
 *   ]
 *
 * To add a confirmed variant: copy the pattern and add one line. That's it —
 * the "View Projects" button will pick it up on the next page load.
 * -----------------------------------------------------------
 */
const PI_ALIASES = {
  // Confirmed by client (2026-07-03): only "Dr. H. Amarananjundeswara" (8 projects).
  // "Dr. Amarananjudeshwar" (4 projects) is NOT this person — do not add it.
  // (Name in the official staff file is "Dr. Amarananjundeshwara H".)
  "Dr. Amarananjundeshwara H": ["Dr. H. Amarananjundeswara"],

  // Confirmed by client (2026-07-04) — spelling variants used on projects.
  // (Matching ignores honorifics/commas, so one spelling per person catches all.)
  "Dr. Swetha B.S.":            ["Dr. Shwetha B. S"],       // NOT "Swetha Hiremath" (diff. person)
  "Dr. Namitha B. Raut":       ["Dr. Namita Raut"],
  "Dr. Suresh G J":            ["Dr. Suresha G. J"],
  "Dr. Kirankumar Gorabal":    ["Dr. Kiran Kumar Gorbal"],
  "Dr. Adbul Rahaman M. Nadaf": ["Dr. A. M. Nadaf"]
};
