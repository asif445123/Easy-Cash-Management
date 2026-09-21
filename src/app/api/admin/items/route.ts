import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Item from "@/models/Item";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  await connectDB();
  const items = await Item.find().sort({ createdAt: -1 });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const body = await req.json();
  const { code, name, category, brand, color, unit, costPrice, salePrice, openingStock, reorderLevel } =
    body;

  if (!code || !name) {
    return NextResponse.json({ message: "Item code and name are required." }, { status: 400 });
  }

  await connectDB();

  const existing = await Item.findOne({ code: code.trim() });
  if (existing) {
    return NextResponse.json({ message: "An item with this code already exists." }, { status: 409 });
  }

  const item = await Item.create({
    code: code.trim(),
    name: name.trim(),
    category,
    brand,
    color,
    unit: unit || "pcs",
    costPrice: costPrice ?? 0,
    salePrice: salePrice ?? 0,
    openingStock: openingStock ?? 0,
    currentStock: openingStock ?? 0,
    reorderLevel: reorderLevel ?? 0,
  });

  return NextResponse.json({ message: "Item created.", item }, { status: 201 });
}
