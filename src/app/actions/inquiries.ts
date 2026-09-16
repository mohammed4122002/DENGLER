"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { store } from "@/lib/store";

/**
 * Server-side validation of the contact / investment-request forms.
 *
 * The client form validates too, but only this matters — the action is a
 * public endpoint and must assume the browser checks were skipped.
 */
const inquirySchema = z.object({
  propertyId: z.string().max(120).optional().nullable(),
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email address").max(200),
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[\d\s()+.-]*$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little more — at least 10 characters")
    .max(4000),
  /** Honeypot. Real users never see this field, so anything in it is a bot. */
  company: z.string().max(0).optional().or(z.literal("")),
});

export interface InquiryState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "phone" | "message", string>>;
}

export async function submitInquiry(
  _previous: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const parsed = inquirySchema.safeParse({
    propertyId: formData.get("propertyId") || null,
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    message: formData.get("message") ?? "",
    company: formData.get("company") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: InquiryState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "company") {
        // Honeypot tripped — accept silently rather than telling a bot why.
        return { status: "success", message: "Thank you — we will be in touch." };
      }
      if (
        key === "name" ||
        key === "email" ||
        key === "phone" ||
        key === "message"
      ) {
        fieldErrors[key] ??= issue.message;
      }
    }
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  const { propertyId, name, email, phone, message } = parsed.data;

  try {
    await store.createInquiry({
      property_id: propertyId || null,
      name,
      email,
      phone: phone || null,
      message,
    });
  } catch (error) {
    console.error("Failed to record inquiry", error);
    return {
      status: "error",
      message:
        "We could not record that just now. Please try again, or email us directly.",
    };
  }

  revalidatePath("/admin/leads");

  return {
    status: "success",
    message:
      "Thank you — an advisor will come back to you within one business day.",
  };
}
