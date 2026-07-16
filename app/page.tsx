import HomeClient from "../components/Home/HomeClient";
import { getApartments } from "../lib/getApartments";

export default async function Home() {
  const apartments = await getApartments();

  return <HomeClient apartments={apartments} />;
}