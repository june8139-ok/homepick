import { getApartments } from "../../lib/getApartments";
import CompareClient from "./CompareClient";

export default async function ComparePage() {
  const apartments = await getApartments();

  return <CompareClient apartments={apartments} />;
}