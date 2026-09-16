"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { store } from "@/lib/store";
import {
  DEFAULT_LOCALE,
  getDictionary,
  isLocale,
  localePath,
  LOCALES,
} from "@/lib/i18n";

/**
 * Server-side validation of the contact / investment-request forms.
 *
 * The client form validates too, but only this matters — the action is a
 * public endpoint and must assume the browser checks were skipped.
 *
 * The schema is built per request so that its messages come back in the
 * visitor's language. The locale arrives as a hidden field rather than from
 * a header, because the form knows which site rendered it.
 */
function buildSchema(t: ReturnType<typeof getDictionary>) {
  return z.object({
    propertyId: z.string().max(120).optional().nullable(),
    name: z.string().trim().min(2, t.form.errors.name).max(120),
    email: z.string().trim().email(t.form.errors.email).max(200),
    phone: z
      .string()
      .trim()
      .max(40)
      .regex(/^[\d\s()+.-]*$/, t.form.errors.phone)
      .optional()
      .or(z.literal("")),
    message: z.string().trim().min(10, t.form.errors.message).max(4000),
    /** Honeypot. Real users never see this field, so anything in it is a bot. */
    company: z.string().max(0).optional().or(z.literal("")),
  });
}

export interface InquiryState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "phone" | "message", string>>;
}

export async function submitInquiry(
  _previous: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const rawLocale = String(formData.get("locale") ?? "");
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = getDictionary(locale);

  const parsed = buildSchema(t).safeParse({
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
        return { status: "success", message: t.form.thanks };
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
    return { status: "error", message: t.form.checkFields, fieldErrors };
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
    return { status: "error", message: t.form.couldNotRecord };
  }

  for (const l of LOCALES) revalidatePath(localePath(l, "/admin/leads"));

  return { status: "success", message: t.form.thanks };
}
