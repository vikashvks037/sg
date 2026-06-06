import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-8xl font-bold text-[#CF1432] font-playfair">404</h1>
      <h2 className="text-2xl font-bold mt-4 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8">The page you are looking for doesn&apos;t exist.</p>
      <Link href="/" className="bg-[#CF1432] text-white px-8 py-3 rounded-full font-semibold hover:bg-red-700 transition">
        Back to Home
      </Link>
    </div>
  );
}
