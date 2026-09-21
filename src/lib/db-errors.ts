import { NextResponse } from "next/server";

/**
 * Turns a thrown error from a Mongoose operation into a proper JSON
 * response instead of letting it crash the route (which returns an empty
 * or HTML error page — the client then fails on res.json() with
 * "Unexpected end of JSON input").
 *
 * Handles the most common case specially: a MongoDB duplicate-key error
 * (code 11000), most often caused by a leftover *old* unique index from
 * before per-user scoping was added (e.g. a global unique index on
 * `serial` or `type` that MongoDB never dropped automatically). If you see
 * this a lot, check your collection's indexes — see MANIFEST notes.
 */
export function handleApiError(err: unknown) {
  const anyErr = err as any;

  if (anyErr?.code === 11000) {
    return NextResponse.json(
      {
        message:
          "That value is already in use. If you recently upgraded to per-user accounts, you may still have an old global-uniqueness index in MongoDB that needs to be dropped — see MANIFEST.md.",
      },
      { status: 409 }
    );
  }

  if (anyErr?.name === "ValidationError") {
    return NextResponse.json({ message: anyErr.message || "Invalid data." }, { status: 400 });
  }

  console.error("API error:", err);
  return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
}
