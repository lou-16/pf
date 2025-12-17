import Loader from "@/components/Loader";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black font-sans dark:bg-black">
      <div className="text-white">
        <h1 className="text-white text-5xl transition-all hover:text-gray-500 duration-150 cursor-default">Hi! Visitor</h1>
        <Loader />
      </div>
    </div>
  );
}