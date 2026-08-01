const FAVORITES_KEY =
  "jibnun-favorite-apartments";

function emitFavoritesChanged() {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      "jibnun:favorites-changed"
    )
  );
}

export function getFavoriteApartmentSlugs(): string[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        FAVORITES_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (
          value
        ): value is string =>
          typeof value ===
            "string" &&
          Boolean(value.trim())
      )
      .map((value) =>
        value.trim()
      )
      .filter(
        (
          value,
          index,
          array
        ) =>
          array.indexOf(
            value
          ) === index
      );
  } catch {
    return [];
  }
}

export function saveFavoriteApartmentSlugs(
  slugs: string[]
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const normalized = [
    ...new Set(
      slugs
        .map((slug) =>
          slug.trim()
        )
        .filter(Boolean)
    ),
  ];

  window.localStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(
      normalized
    )
  );

  emitFavoritesChanged();
}

export function isFavoriteApartment(
  slug: string
) {
  return getFavoriteApartmentSlugs().includes(
    slug
  );
}

export function toggleFavoriteApartment(
  slug: string
) {
  const current =
    getFavoriteApartmentSlugs();

  const exists =
    current.includes(slug);

  const next = exists
    ? current.filter(
        (item) =>
          item !== slug
      )
    : [...current, slug];

  saveFavoriteApartmentSlugs(
    next
  );

  return !exists;
}

export function removeFavoriteApartment(
  slug: string
) {
  saveFavoriteApartmentSlugs(
    getFavoriteApartmentSlugs().filter(
      (item) =>
        item !== slug
    )
  );
}
