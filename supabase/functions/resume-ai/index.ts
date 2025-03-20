/// <reference types="deno" />
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// For Supabase Edge Functions, environment variables need to be set using Supabase CLI
// or through the Supabase dashboard, not through .env.local files
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body and check for API key
    const { prompt, resume, action } = await req.json();

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Missing Gemini API key. Please set the GEMINI_API_KEY in the Edge Function Secrets.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare the prompt based on the action
    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "improve":
        systemPrompt = "You are an expert resume writer and career coach. Your task is to provide specific, actionable feedback to improve a resume section.";
        userPrompt = `Please review and provide improvements for this resume section:\n\n${prompt}\n\nFocus on making it more impactful, professional, and tailored for job applications.`;
        break;
      case "generate":
        systemPrompt = "You are an expert resume writer. Your task is to generate professional resume content based on the prompt.";
        userPrompt = `Please generate the following resume content:\n\n${prompt}\n\nMake it professional, concise, and impactful.`;
        break;
      case "analyze":
        systemPrompt = "You are an expert resume analyst. Your task is to analyze a resume and provide feedback on its strengths and weaknesses.";
        userPrompt = `Please analyze this resume and provide detailed feedback:\n\n${JSON.stringify(resume)}\n\nEvaluate the structure, content, impact, and suggestions for improvement.`;
        break;
      default:
        userPrompt = prompt;
    }

    // Call Gemini API
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt + "\n\n" + userPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    const result = await response.json();

    // Handle successful response
    if (result.candidates && result.candidates.length > 0) {
      const content = result.candidates[0].content;
      const text = content.parts[0].text;
      
      return new Response(
        JSON.stringify({ result: text }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      // Handle API error or no results
      console.error("Gemini API error:", JSON.stringify(result));
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate content",
          details: result.error?.message || "No content generated" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: any) {
    console.error("Server error:", error.message);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
