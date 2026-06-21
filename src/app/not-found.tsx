import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-8xl">🎂</p>
        <h1 className="mt-4 font-display text-5xl font-black">404</h1>
        <p className="mt-2 text-muted">This slice doesn’t exist. Maybe someone ate it.</p>
        <Link href="/" className="btn-primary mt-8"><Home className="h-4 w-4" /> Back to safety</Link>
      </div>
    </div>
  );
}
