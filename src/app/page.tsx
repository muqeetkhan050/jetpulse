// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <h1 className="text-3xl font-bold text-black dark:text-white">Welcome to Jetpulse</h1>
//     </div>
//   );
// }


import FlightTracker from '../components/FlightTracker';

export default function Home() {
  return (
    <main className="w-screen h-screen">
      <FlightTracker />
    </main>
  );
}
