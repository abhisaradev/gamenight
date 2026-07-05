import Link from "next/link";
import WordClient from "./WordClient";

export const metadata = {
  title: "Word Generator · Game Night",
};

export default function WordGeneratorPage() {
  return (
    <main>
      <div className="screen-header">
        <Link href="/" className="back-btn">
          ←
        </Link>
        <div className="screen-title">🔤 Word Generator</div>
      </div>
      <WordClient />
    </main>
  );
}
