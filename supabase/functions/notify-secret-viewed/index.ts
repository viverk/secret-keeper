import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ViewNotification {
  secretId: string;
  userAgent: string;
  location: string;
  notifyEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { secretId, userAgent, location, notifyEmail }: ViewNotification = await req.json();

    console.log("Sending email notification:", {
      secretId,
      userAgent,
      location,
      notifyEmail,
      RESEND_API_KEY_EXISTS: !!RESEND_API_KEY,
    });

    const emailContent = `
      <h2>Votre secret a été consulté !</h2>
      <p>Détails de la consultation :</p>
      <ul>
        <li><strong>ID du secret:</strong> ${secretId}</li>
        <li><strong>User Agent:</strong> ${userAgent}</li>
        <li><strong>Localisation:</strong> ${location}</li>
      </ul>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "secret-keeper@no-reply.com",
        to: [notifyEmail],
        subject: "Votre secret a été consulté",
        html: emailContent,
      }),
    });

    const responseData = await res.text();
    console.log("Resend API response:", {
      status: res.status,
      data: responseData,
    });

    if (!res.ok) {
      throw new Error(`Failed to send email: ${responseData}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in notify-secret-viewed function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);