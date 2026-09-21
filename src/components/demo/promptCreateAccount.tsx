import Swal from "sweetalert2";
import type { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;

/**
 * Shown any time a demo visitor clicks something that would normally write
 * data or run a real query (Save, Preview, Print, filters, etc). The pages
 * themselves stay fully visible and read-only — this only fires on actions.
 */
export async function promptCreateAccount(router: Router, action: string) {
  const result = await Swal.fire({
    icon: "info",
    title: action,
    text: "You're viewing sample data. Create a free account to do this for real — your first admin account gets approved automatically.",
    showCancelButton: true,
    confirmButtonText: "Create free account",
    cancelButtonText: "Keep exploring",
    confirmButtonColor: "#0E7C4A",
  });
  if (result.isConfirmed) {
    router.push("/register");
  }
}
