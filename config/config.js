/**
 * UHS-PIMS — General App Configuration
 */
const APP_CONFIG = {
  appName: "UHS-PIMS",
  fullName: "UHS Project Information Management System",
  university: "University of Horticultural Sciences",
  fundingTypes: ["University Funded", "External Funded"],
  statusOptions: ["Ongoing", "Completed", "Proposed", "Terminated"],
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
  statusColors: {
    Ongoing: "#2E8B45",
    Completed: "#C8912C",
    Proposed: "#1D77A6",
    Terminated: "#B4472A"
  }
};
