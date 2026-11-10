/**
 * Acceso al currículo: se descarga una vez, se guarda en memoria y se aplana
 * para la navegación. Forma del JSON: parts -> lessons. Las rutas de los
 * archivos son relativas a la raíz del sitio.
 */

const CURRICULUM_URL = 'content/curriculum.json';

let curriculumCache = null;
let flat = [];
let index = new Map();
let inflight = null;

/** Validación mínima para que un JSON roto falle con un mensaje claro. */
function assertValid(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.parts)) {
    throw new Error('El currículo no tiene la estructura esperada (falta "parts").');
  }
}

/** Aplana parts -> lessons respetando el orden del documento. */
function buildFlat(curriculum) {
  const lessons = [];
  let number = 0;
  curriculum.parts.forEach((part, i) => {
    for (const lesson of part.lessons || []) {
      const cierre = lesson.kind === 'cierre';
      if (!cierre) number += 1;
      lessons.push({
        ...lesson,
        partId: part.id,
        partTitle: part.title,
        partIndex: i + 1,
        number: cierre ? null : number,
      });
    }
  });
  return lessons;
}

/** Registra un currículo ya leído (también lo usan las pruebas). */
export function setCurriculum(data) {
  assertValid(data);
  curriculumCache = data;
  flat = buildFlat(data);
  index = new Map(flat.map((l) => [l.id, l]));
  return data;
}

/**
 * Descarga el currículo una sola vez.
 * @param {boolean} [force]
 * @returns {Promise<Object>}
 */
export function loadCurriculum(force = false) {
  if (curriculumCache && !force) return Promise.resolve(curriculumCache);
  if (inflight) return inflight;
  inflight = fetch(CURRICULUM_URL, { headers: { Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`No se pudo cargar el currículo (HTTP ${response.status}).`);
      }
      return response.json();
    })
    .then(setCurriculum)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function getCurriculum() {
  return curriculumCache;
}

/** Todas las lecciones (y cierres) en orden, con su parte y número. */
export function allLessons() {
  return [...flat];
}

/** Lecciones de una parte, en orden. */
export function lessonsOfPart(partId) {
  return flat.filter((l) => l.partId === partId);
}

export function findLesson(id) {
  return (id && index.get(id)) || null;
}

/** Anterior y siguiente en el orden global, cruzando partes. */
export function neighbours(id) {
  const i = flat.findIndex((l) => l.id === id);
  if (i === -1) return { prev: null, next: null };
  return { prev: flat[i - 1] || null, next: flat[i + 1] || null };
}

export function totalLessons() {
  return flat.length;
}

/**
 * Descarga el Markdown de una lección.
 * @param {Object|string} lesson
 * @returns {Promise<string>}
 */
export async function loadLessonBody(lesson) {
  const target = typeof lesson === 'string' ? findLesson(lesson) : lesson;
  if (!target || !target.file) throw new Error('La lección no tiene un archivo asociado.');
  const response = await fetch(target.file, { headers: { Accept: 'text/markdown' } });
  if (!response.ok) {
    throw new Error(`No se pudo cargar el contenido de la lección (HTTP ${response.status}).`);
  }
  return response.text();
}
