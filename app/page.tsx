import Image from "next/image";
import RecipeList from "./components/RecipeList";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <RecipeList />
    </main>
  );
}
