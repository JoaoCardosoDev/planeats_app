import Greeting from "@/components/Greeting";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-100">
      <div className="text-center mb-12">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert mx-auto"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
        <p className="mt-4 text-lg text-gray-700">Welcome to PlanEats Frontend!</p>
      </div>

      <Greeting name="Developer" />

      <div className="mt-12 p-6 border border-dashed border-sky-500 rounded-md bg-sky-50">
        <p className="text-sky-700">
          This area uses Tailwind classes for styling the border, background, and text.
        </p>
        <p className="mt-2 text-sm text-sky-600">
          Check <code className="font-mono bg-sky-200 px-1 rounded">src/app/page.tsx</code> and <code className="font-mono bg-sky-200 px-1 rounded">src/components/Greeting.tsx</code>.
        </p>
      </div>
    </main>
  );
}
