// app/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../lib/authOptions";
import PredictionPage from "./PredictionPage";
import { Suspense } from "react";


export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) 
    redirect("/login");
  

  return (
    <Suspense>
      <div className="animate-fade-in">
        <PredictionPage />
      </div>
    </Suspense>
  );
}