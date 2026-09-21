import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Brand from "@/models/Brand";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  await connectDB();
  const brands = await Brand.find().sort({ name: 1 });
  return NextResponse.json({ brands });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ message: "Brand name is required." }, { status: 400 });
  }

  await connectDB();

  const existing = await Brand.findOne({ name: name.trim() });
  if (existing) {
    return NextResponse.json({ message: "This brand already exists." }, { status: 409 });
  }

  const brand = await Brand.create({ name: name.trim() });
  return NextResponse.json({ message: "Brand created.", brand }, { status: 201 });
}
