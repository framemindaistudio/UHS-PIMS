/**
 * UHS-RIMS — General App Configuration
 */
const APP_CONFIG = {
  appName: "UHS-RIMS",
  fullName: "UHS Research Information Management System",
  university: "University of Horticultural Sciences, Bagalkot",
  // Branding — single source of truth for the app name, tagline, university
  // line and logo shown in the sidebar, topbar, login screen and footer.
  // logoUrl is resolved relative to the /pages/ folder (where every branded
  // screen lives), so keep the "../assets/..." prefix.
  branding: {
    logoUrl: "../assets/images/Logo.png",
    appName: "UHS-RIMS",
    tagline: "Director of Research",
    university: "University of Horticultural Sciences, Bagalkot",
    footerName: "University of Horticultural Sciences, Bagalkot"
  },
  fundingTypes: ["University Funded", "External Funded"],
  statusOptions: ["Ongoing", "Completed", "Proposed", "Terminated"],
  // Superannuation age — retirement date = date of birth + this many years.
  retirementAge: 62,
  designationOptions: [
    "Professor & Head",
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Principal Scientist",
    "Senior Scientist",
    "Scientist",
    "Research Associate",
    "Dean",
    "Director"
  ],
  durationBuckets: [
    { value: "0-12", label: "Up to 1 year" },
    { value: "13-24", label: "1–2 years" },
    { value: "25-36", label: "2–3 years" },
    { value: "37+", label: "Over 3 years" }
  ],
  // Validated (light + dark, CVD-safe) status palette for charts.
  statusColors: {
    Ongoing: "#2E8B45",
    Completed: "#9C6F12",
    Proposed: "#1D77A6",
    Terminated: "#B4472A"
  }
};
