import { OutingPlan } from "../types";

export const outingPlans: Record<string, OutingPlan> = {
  "carthage-international-festival": {
    weather: "28°C Sunny, light sea breeze — perfect outdoor evening",
    transport: "SuperTounsi Taxi — 8 min away · Estimated 12 DT",
    dinner: "Dar El Jeld (1km) — book for 19:00 · 35 DT avg per person",
    hotel: "Hotel Amilcar 3★ — 2.1km · from 180 DT/night",
    budget: "267 DT incl. ticket, dinner & taxi",
    tips: "Arrive 30 min early for best views. Parking: Rue de Carthage (free)",
  },
  "tunis-run-10k": {
    weather: "24°C Clear, cool morning breeze — ideal running conditions",
    transport: "SuperTounsi Taxi — 8 min away · Estimated 12 DT",
    dinner: "Dar El Jeld (1km) — book for 19:00 · 35 DT avg per person",
    hotel: "Hotel Amilcar 3★ — 2.1km · from 180 DT/night",
    budget: "242 DT incl. ticket, dinner & taxi",
    tips: "Arrive 30 min early for best views. Parking: Rue de Carthage (free)",
  },
  "djerba-gourmet-festival": {
    weather: "31°C Sunny, warm coastal breeze — great for an evening out",
    transport: "SuperTounsi Taxi — 10 min away · Estimated 15 DT",
    dinner: "Restaurant Essaraya (0.8km) — book for 19:30 · 30 DT avg per person",
    hotel: "Hotel Djerba Plaza 3★ — 1.5km · from 150 DT/night",
    budget: "210 DT incl. ticket, dinner & taxi",
    tips: "Arrive 30 min early for best stalls. Parking: Zone Touristique (free)",
  },
  "hammamet-beach-weekend": {
    weather: "29°C Sunny, gentle sea breeze — perfect beach weather",
    transport: "SuperTounsi Taxi — 12 min away · Estimated 18 DT",
    dinner: "Le Pirate (0.5km) — book for 20:00 · 45 DT avg per person",
    hotel: "Hammamet Beach Club — on-site · from 180 DT/night",
    budget: "395 DT incl. stay, dinner & taxi",
    tips: "Bring sun protection. Free parking available on-site.",
  },
  "cine-tunis-summer-screenings": {
    weather: "26°C Clear evening, mild breeze — comfortable for open-air cinema",
    transport: "SuperTounsi Taxi — 9 min away · Estimated 13 DT",
    dinner: "Le Golfe (0.6km) — book for 19:00 · 28 DT avg per person",
    hotel: "La Marsa Suites 3★ — 1.2km · from 160 DT/night",
    budget: "195 DT incl. ticket, dinner & taxi",
    tips: "Bring a light jacket for the evening. Parking: Avenue Habib Bourguiba (free)",
  },
  "tedx-tunis-2026": {
    weather: "27°C Sunny, calm morning — pleasant for the full-day event",
    transport: "SuperTounsi Taxi — 7 min away · Estimated 10 DT",
    dinner: "Fondouk El Attarine (1km) — book for 19:00 · 40 DT avg per person",
    hotel: "Hotel Africa 4★ — 0.9km · from 220 DT/night",
    budget: "340 DT incl. ticket, dinner & taxi",
    tips: "Arrive 30 min early for badge pickup. Parking: Palais des Congrès (paid)",
  },
};

export const getOutingPlan = (eventId: string): OutingPlan =>
  outingPlans[eventId] ?? outingPlans["carthage-international-festival"];
