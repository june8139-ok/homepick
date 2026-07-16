import SearchClient from "./SearchClient";
import { getApartments } from "../../lib/getApartments";

export default async function SearchPage() {
  const apartments = await getApartments();

  return <SearchClient apartments={apartments} />;
}