import type { GoalBlueprint, GoalIconName, GoalShape } from '@/src/features/smart-saving/types/goal-blueprint';

const GEMINI_MODEL = 'gemini-3.5-flash';
const MAX_GEMINI_UNAVAILABLE_RETRIES = 2;
const VALID_SHAPES: GoalShape[] = [
  'house',
  'car',
  'plane',
  'phone',
  'laptop',
  'gift',
  'education',
  'wedding',
  'rocket',
  'tower',
];

const VALID_ICONS: GoalIconName[] = [
  'airplane',
  'home',
  'car-sport',
  'phone-portrait',
  'laptop-outline',
  'gift-outline',
  'school',
  'heart',
  'rocket',
  'diamond-outline',
  'bicycle',
  'camera',
  'medkit',
  'cart',
  'game-controller',
  'musical-notes',
  'fitness',
  'restaurant',
  'leaf',
  'trophy',
];

type GeminiBlueprintResponse = {
  shape?: string;
  icon?: string;
  accent?: string;
  blockTop?: string;
  blockSide?: string;
  blockFront?: string;
  label?: string;
  buildCaption?: string;
};

function getApiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() || undefined;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function sanitizeShape(value?: string): GoalShape {
  if (value && VALID_SHAPES.includes(value as GoalShape)) {
    return value as GoalShape;
  }
  return 'tower';
}

function sanitizeIcon(value?: string): GoalIconName {
  if (value && (VALID_ICONS as string[]).includes(value)) {
    return value as GoalIconName;
  }
  return 'rocket';
}

function sanitizeColor(value: string | undefined, fallback: string): string {
  return value && isHexColor(value) ? value : fallback;
}

function parseGeminiJson(text: string): GeminiBlueprintResponse | null {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as GeminiBlueprintResponse;
  } catch {
    return null;
  }
}

/** Ask Gemini to classify a savings goal and pick colors + 3D shape. */
export async function generateGoalBlueprintWithGemini(title: string): Promise<GoalBlueprint | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const prompt = `You are designing a 3D voxel savings goal visualization for a mobile app.

Goal title: "${title}"

Return ONLY valid JSON (no markdown) with this exact schema:
{
  "shape": one of ${VALID_SHAPES.join('|')},
  "icon": one of ${VALID_ICONS.join('|')},
  "accent": "#RRGGBB",
  "blockTop": "#RRGGBB lighter top face",
  "blockSide": "#RRGGBB darker side face",
  "blockFront": "#RRGGBB medium front face",
  "label": "short French label max 24 chars",
  "buildCaption": "short French phrase describing what is being built, max 60 chars",
  "milestoneLow": "Tunisian or French congratulatory phrase when 15% is reached (e.g. Mabrouk! Châssis & Roues débloqués for a car, Fondations prêtes for a house, etc.)",
  "milestoneMid": "Tunisian or French congratulatory phrase when 40% is reached (e.g. Mabrouk! Carrosserie débloquée for a car, Murs construits for a house, etc.)",
  "milestoneHigh": "Tunisian or French congratulatory phrase when 65% is reached (e.g. Mabrouk! Pare-brise & Portes débloqués for a car, Toit & Finitions débloqués for a house, etc.)"
}

Rules:
- shape MUST match the goal (travel→plane, house→house, car→car, phone→phone, laptop/pc→laptop, wedding→wedding, studies→education, health→gift or rocket, default→tower)
- colors must harmonize with the goal theme
- respond in French/Tunisian dialect for labels, captions, and milestones`;

  try {
    let response: Response;
    for (let attempt = 0; ; attempt += 1) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.35,
              responseMimeType: 'application/json',
            },
          }),
        },
      );

      if (response.status !== 503 || attempt === MAX_GEMINI_UNAVAILABLE_RETRIES) break;
      await wait(800 * 2 ** attempt + Math.random() * 200);
    }

    if (!response.ok) {
      console.warn('Gemini API error:', response.status, await response.text());
      return null;
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = parseGeminiJson(text);
    if (!parsed) return null;

    const shape = sanitizeShape(parsed.shape);
    const defaults = localBlueprintDefaults(title, shape);

    return {
      shape,
      icon: sanitizeIcon(parsed.icon),
      accent: sanitizeColor(parsed.accent, defaults.accent),
      blockTop: sanitizeColor(parsed.blockTop, defaults.blockTop),
      blockSide: sanitizeColor(parsed.blockSide, defaults.blockSide),
      blockFront: sanitizeColor(parsed.blockFront, defaults.blockFront),
      label: (parsed.label ?? defaults.label).slice(0, 24),
      buildCaption: (parsed.buildCaption ?? defaults.buildCaption).slice(0, 60),
      milestoneLow: parsed.milestoneLow ?? defaults.milestoneLow,
      milestoneMid: parsed.milestoneMid ?? defaults.milestoneMid,
      milestoneHigh: parsed.milestoneHigh ?? defaults.milestoneHigh,
      source: 'gemini',
    };
  } catch (error) {
    console.warn('Gemini blueprint generation failed:', error);
    return null;
  }
}

/** Local defaults used when Gemini is unavailable or for color fallbacks. */
export function localBlueprintDefaults(title: string, shape: GoalShape): Omit<GoalBlueprint, 'source'> {
  const normalized = title.toLowerCase();

  const presets: Record<GoalShape, Omit<GoalBlueprint, 'source'>> = {
    plane: {
      shape: 'plane',
      icon: 'airplane',
      accent: '#3A8DFF',
      blockTop: '#5BA4FF',
      blockSide: '#2563B8',
      blockFront: '#2F6FCC',
      label: 'Voyage',
      buildCaption: 'Assemblage de votre prochain départ…',
      milestoneLow: 'Mabrouk! Billet d'avion débloqué ! ✈️',
      milestoneMid: 'Mabrouk! Hôtel & Bagages débloqués ! 🏨',
      milestoneHigh: 'Mabrouk! Activités & Guide débloqués ! 🗺️',
    },
    house: {
      shape: 'house',
      icon: 'home',
      accent: '#ECC863',
      blockTop: '#F5D97A',
      blockSide: '#A88832',
      blockFront: '#C9A84A',
      label: 'Maison',
      buildCaption: 'Fondations, murs, puis toit…',
      milestoneLow: 'Mabrouk! Fondations & Dalle prêtes ! 🏗️',
      milestoneMid: 'Mabrouk! Murs & Cloisons construits ! 🏠',
      milestoneHigh: 'Mabrouk! Toiture & Finitions débloquées ! 🔑',
    },
    car: {
      shape: 'car',
      icon: 'car-sport',
      accent: '#12C979',
      blockTop: '#3DDA98',
      blockSide: '#0B8A52',
      blockFront: '#0FA864',
      label: 'Véhicule',
      buildCaption: 'Châssis, carrosserie, habitacle…',
      milestoneLow: 'Mabrouk! Châssis & Roues débloqués ! 🚗',
      milestoneMid: 'Mabrouk! Moteur & Direction débloqués ! ⚙️',
      milestoneHigh: 'Mabrouk! Carrosserie & Habitacle prêts ! 🏁',
    },
    phone: {
      shape: 'phone',
      icon: 'phone-portrait',
      accent: '#A78BFA',
      blockTop: '#C4B5FD',
      blockSide: '#7C3AED',
      blockFront: '#8B5CF6',
      label: 'Smartphone',
      buildCaption: 'Montage couche par couche…',
      milestoneLow: 'Mabrouk! Batterie & Processeur débloqués ! 🔋',
      milestoneMid: 'Mabrouk! Écran OLED & Châssis montés ! 📱',
      milestoneHigh: 'Mabrouk! Caméra & Capteurs configurés ! 📸',
    },
    laptop: {
      shape: 'laptop',
      icon: 'laptop-outline',
      accent: '#38BDF8',
      blockTop: '#7DD3FC',
      blockSide: '#0284C7',
      blockFront: '#0EA5E9',
      label: 'Ordinateur',
      buildCaption: 'Base, écran, finitions…',
      milestoneLow: 'Mabrouk! Carte mère & RAM débloquées ! 💾',
      milestoneMid: 'Mabrouk! Boîtier & Clavier débloqués ! ⌨️',
      milestoneHigh: 'Mabrouk! Écran & Carte graphique montés ! 🎮',
    },
    gift: {
      shape: 'gift',
      icon: 'gift-outline',
      accent: '#FF6B8A',
      blockTop: '#FF8FA8',
      blockSide: '#C73659',
      blockFront: '#E84D6F',
      label: 'Cadeau',
      buildCaption: 'Votre surprise prend forme…',
      milestoneLow: 'Mabrouk! Boîte de surprise débloquée ! 🎁',
      milestoneMid: 'Mabrouk! Cadeau principal débloqué ! 🎀',
      milestoneHigh: 'Mabrouk! Ruban & Carte de voeux prêts ! 🌸',
    },
    education: {
      shape: 'education',
      icon: 'school',
      accent: '#6366F1',
      blockTop: '#A5B4FC',
      blockSide: '#4338CA',
      blockFront: '#4F46E5',
      label: 'Études',
      buildCaption: 'Construction de votre avenir…',
      milestoneLow: 'Mabrouk! Inscription & Dossier payés ! 📝',
      milestoneMid: 'Mabrouk! Livres & Matériel financés ! 📚',
      milestoneHigh: 'Mabrouk! Hébergement & Vie étudiante prêts ! 🎓',
    },
    wedding: {
      shape: 'wedding',
      icon: 'heart',
      accent: '#F472B6',
      blockTop: '#FBCFE8',
      blockSide: '#DB2777',
      blockFront: '#EC4899',
      label: 'Mariage',
      buildCaption: 'Un projet de cœur en construction…',
      milestoneLow: 'Mabrouk! Alliances & Fiançailles débloquées ! 💍',
      milestoneMid: 'Mabrouk! Salle de fête & Traiteur réservés ! 🏰',
      milestoneHigh: 'Mabrouk! Robe & Costume ajustés ! 👗',
    },
    rocket: {
      shape: 'rocket',
      icon: 'rocket',
      accent: '#2F80ED',
      blockTop: '#5BA4FF',
      blockSide: '#1B4F9E',
      blockFront: '#2563B8',
      label: 'Ambition',
      buildCaption: 'Décollage en préparation…',
      milestoneLow: 'Mabrouk! Propulseurs & Réservoir pleins ! 🚀',
      milestoneMid: 'Mabrouk! Module de pilotage activé ! 🛰️',
      milestoneHigh: 'Mabrouk! Compte à rebours lancé ! 📡',
    },
    tower: {
      shape: 'tower',
      icon: 'diamond-outline',
      accent: '#2F80ED',
      blockTop: '#5BA4FF',
      blockSide: '#1B4F9E',
      blockFront: '#2563B8',
      label: 'Objectif',
      buildCaption: 'Construction en cours…',
      milestoneLow: 'Mabrouk! Premier étage & Fondations posés ! 🏢',
      milestoneMid: 'Mabrouk! Deuxième étage & Charpente construits ! 🏢',
      milestoneHigh: 'Mabrouk! Dernier étage & Flèche installés ! 🏆',
    },
  };

  return presets[shape];
}

export function inferShapeFromTitle(title: string): GoalShape {
  const t = title.toLowerCase();
  if (/voyage|djerba|vacance|avion|trip|plage|hotel|billet/.test(t)) return 'plane';
  if (/maison|appart|home|house|immobil|studio|villa/.test(t)) return 'house';
  if (/voiture|car|auto|moto|véhicule|vehicle/.test(t)) return 'car';
  if (/phone|téléphone|iphone|samsung|smartphone/.test(t)) return 'phone';
  if (/pc|laptop|macbook|ordinateur|computer|tech/.test(t)) return 'laptop';
  if (/mariage|wedding|fianc|love|amour/.test(t)) return 'wedding';
  if (/étude|school|univers|formation|diplôme|master/.test(t)) return 'education';
  if (/cadeau|gift|anniversaire|surprise/.test(t)) return 'gift';
  if (/business|startup|projet|dream|ambition/.test(t)) return 'rocket';
  return 'tower';
}

export function buildLocalBlueprint(title: string): GoalBlueprint {
  const shape = inferShapeFromTitle(title);
  return { ...localBlueprintDefaults(title, shape), source: 'local' };
}
