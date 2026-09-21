import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  await connectDB();
  const categories = await Category.find().sort({ name: 1 });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ message: "Category name is required." }, { status: 400 });
  }

  await connectDB();

  const existing = await Category.findOne({ name: name.trim() });
  if (existing) {
    return NextResponse.json({ message: "This category already exists." }, { status: 409 });
  }

  const category = await Category.create({ name: name.trim() });
  return NextResponse.json({ message: "Category created.", category }, { status: 201 });
}
