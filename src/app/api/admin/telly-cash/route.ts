// app/api/admin/telly-cash/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TellyCash from "@/models/TellyCash";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

export async function GET(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const accountCode = searchParams.get("accountCode");

  try {
    await connectDB();

    // Single entry — used when opening the edit form.
    if (id) {
      const entry = await TellyCash.findOne({ _id: id, userId: user.userId }).lean();
      if (!entry) {
        return NextResponse.json({ message: "Telly count not found." }, { status: 404 });
      }
      return NextResponse.json({ entry });
    }

    // List — used by the history table.
    const filter: Record<string, unknown> = { userId: user.userId };
    if (accountCode) filter.accountCode = accountCode;

    const entries = await TellyCash.find(filter).sort({ date: -1, createdAt: -1 }).limit(50);
    return NextResponse.json({ entries });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const body = await req.json();
  const { accountCode, date, denominations, grandTotal, systemBalance, difference } = body;

  if (!accountCode?.trim() || !date) {
    return NextResponse.json({ message: "Account and date are required." }, { status: 400 });
  }

  try {
    await connectDB();

    const entry = await TellyCash.create({
      userId: user.userId,
      accountCode: accountCode.trim(),
      date,
      denominations: denominations || {},
      grandTotal: grandTotal ?? 0,
      systemBalance: systemBalance ?? 0,
      difference: difference ?? 0,
    });

    return NextResponse.json({ message: "Telly cash saved.", entry }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const body = await req.json();
  const { _id, accountCode, date, denominations, grandTotal, systemBalance, difference } = body;

  if (!_id) {
    return NextResponse.json({ message: "Missing telly id." }, { status: 400 });
  }
  if (!accountCode?.trim() || !date) {
    return NextResponse.json({ message: "Account and date are required." }, { status: 400 });
  }

  try {
    await connectDB();

    const entry = await TellyCash.findOneAndUpdate(
      { _id, userId: user.userId },
      {
        accountCode: accountCode.trim(),
        date,
        denominations: denominations || {},
        grandTotal: grandTotal ?? 0,
        systemBalance: systemBalance ?? 0,
        difference: difference ?? 0,
      },
      { new: true, runValidators: true }
    );

    if (!entry) {
      return NextResponse.json({ message: "Telly count not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Telly cash updated.", entry });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "Missing telly id." }, { status: 400 });
  }

  try {
    await connectDB();

    const deleted = await TellyCash.findOneAndDelete({ _id: id, userId: user.userId });
    if (!deleted) {
      return NextResponse.json({ message: "Telly count not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Telly cash deleted." });
  } catch (err) {
    return handleApiError(err);
  }
}