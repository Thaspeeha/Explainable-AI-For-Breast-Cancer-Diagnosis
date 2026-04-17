// src/app/api/reports/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json(); // your PredictionResponse + extras

  const client = await clientPromise;
  const db = client.db();
  const clinicians = db.collection("clinicians");
  const reports = db.collection("reports");

  const clinician = await clinicians.findOne({ email: session.user.email });
  if (!clinician) {
    return NextResponse.json({ error: "Clinician not found" }, { status: 404 });
  }

  const doc = {
    clinicianId: clinician._id,
    clinicianEmail: session.user.email,
    createdAt: new Date(),
    prediction: body, // store entire result object for now
  };

  const result = await reports.insertOne(doc);

  return NextResponse.json({ ok: true, reportId: result.insertedId.toString() });
}