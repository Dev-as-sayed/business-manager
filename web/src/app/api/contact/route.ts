import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Placeholder: log form data (in a real app, would validate, spam-check, and email)
    console.log("Contact form submission:", body);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Form received. A team member will review shortly.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: "Invalid request" }),
      { status: 400 },
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      form: {
        name: "",
        email: "",
        whatsapp: "",
        country: "",
        services: [],
        project: "",
        budget: "",
        message: "",
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}