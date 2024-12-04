import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ViewNotification {
  secretId: string;
  userAgent?: string;
  location?: string;
  notifyEmail?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { secretId, userAgent, location, notifyEmail }: ViewNotification = await req.json();

    console.log("Starting email notification process:", {
      secretId,
      userAgent,
      location,
      notifyEmail,
      RESEND_API_KEY_EXISTS: !!RESEND_API_KEY,
    });

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const emailContent = `
      <h2>Votre secret a été consulté !</h2>
      <p>Le secret suivant a été consulté :</p>
      <ul>
        <li><strong>ID du secret:</strong> ${secretId}</li>
        <li><strong>Navigateur:</strong> ${userAgent}</li>
        <li><strong>Localisation:</strong> ${location}</li>
      </ul>
    `;

    console.log("Attempting to send email via Resend API");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Secret Share <notifications@secretshare.app>",
        to: [notifyEmail!],
        subject: "Votre secret a été consulté",
        html: emailContent,
      }),
    });

    const responseData = await res.text();
    console.log("Resend API response:", {
      status: res.status,
      statusText: res.statusText,
      data: responseData,
    });

    if (!res.ok) {
      throw new Error(`Failed to send email: ${res.status} ${res.statusText} - ${responseData}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in notify-secret-viewed function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});