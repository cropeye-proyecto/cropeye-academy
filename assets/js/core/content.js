/**
 * Curriculum data access: fetch once, cache in memory, flatten for navigation.
 *
 * The JSON shape is: paths -> modules -> sections -> lessons. Every lesson
 * keeps a `file` path relative to the site root, never absolute.
 */

const CURRICULUM_URL = 'content/curriculum.json';

let curriculumCache = null;
let flatCache = null;
let lessonIndex = null;
let inflight = null;

/** Minimal structural validation so a broken JSON fails loudly, not silently. */
function assertValid(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.paths)) {
    throw new Error('El currículo no tiene la estructura esperada (falta "paths").');
  }
}

/**
 * Fetch the curriculum. Results are cached in memory until `force` is true.
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
    .then((data) => {
      assertValid(data);
      curriculumCache = data;
      flatCache = buildFlatList(data);
      lessonIndex = new Map(flatCache.map((lesson) => [lesson.id, lesson]));
      return data;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/** Flatten paths -> modules -> sections -> lessons, preserving document order. */
function buildFlatList(curriculum) {
  const lessons = [];

  for (const path of curriculum.paths || []) {
    for (const module of path.modules || []) {
      for (const section of module.sections || []) {
        for (const lesson of section.lessons || []) {
          lessons.push({
            ...lesson,
            pathId: path.id,
            pathTitle: path.title,
            moduleId: module.id,
            moduleTitle: module.title,
            sectionId: section.id,
            sectionTitle: section.title,
          });
        }
      }
    }
  }

  return lessons;
}

function ensureIndex() {
  if (!curriculumCache) {
    throw new Error('El currículo todavía no está cargado.');
  }
  if (!flatCache) {
    flatCache = buildFlatList(curriculumCache);
    lessonIndex = new Map(flatCache.map((lesson) => [lesson.id, lesson]));
  }
  return flatCache;
}

/** Currently cached curriculum (or null). */
export function getCurriculum() {
  return curriculumCache;
}

/**
 * All lessons in global order, annotated with their path/module/section.
 * @param {Object} [curriculum]
 * @returns {Array<Object>}
 */
export function allLessons(curriculum) {
  if (!curriculum || curriculum === curriculumCache) {
    return curriculumCache ? [...ensureIndex()] : [];
  }
  return buildFlatList(curriculum);
}

/**
 * Find a lesson by id.
 * @param {string} id
 * @returns {Object|null}
 */
export function findLesson(id) {
  if (!id || !curriculumCache) return null;
  ensureIndex();
  return lessonIndex.get(id) || null;
}

/**
 * Previous and next lesson in global order, crossing module and path borders.
 * @param {string} id
 * @returns {{prev: Object|null, next: Object|null}}
 */
export function neighbours(id) {
  const lessons = ensureIndex();
  const index = lessons.findIndex((lesson) => lesson.id === id);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? lessons[index - 1] : null,
    next: index < lessons.length - 1 ? lessons[index + 1] : null,
  };
}

/** Total lesson count. */
export function totalLessons(curriculum) {
  return allLessons(curriculum).length;
}

/**
 * Fetch the Markdown body of a lesson.
 * @param {Object|string} lesson lesson object or lesson id
 * @returns {Promise<string>}
 */
export async function loadLessonBody(lesson) {
  const target = typeof lesson === 'string' ? findLesson(lesson) : lesson;

  if (!target || !target.file) {
    throw new Error('La lección no tiene un archivo asociado.');
  }

  const response = await fetch(target.file, { headers: { Accept: 'text/markdown' } });
  if (!response.ok) {
    throw new Error(`No se pudo cargar el contenido de la lección (HTTP ${response.status}).`);
  }
  return response.text();
}
