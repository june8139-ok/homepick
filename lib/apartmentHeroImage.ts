import type { Apartment } from "../types/apartment";

export function getHeroImage(apartment?: Apartment | null) {
  const images = apartment?.images;
  return [images?.hero, ...(images?.gallery ?? [])].find(
    (image): image is string => Boolean(image?.trim()) &&
      !image?.includes("/images/apartments/default/main.jpg"),
  )?.trim() ?? "";
}
