import { NextResponse } from "next/server";
import { DeepgramClient } from "@deepgram/sdk";

export async function GET() {
  try {
    if (!process.env.DEEPGRAM_API_KEY) {
      return NextResponse.json(
        { error: "Deepgram API key is missing" },
        { status: 500 }
      );
    }

    const deepgram = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY });
    
    // Get the first project
    const projectsResponse = await deepgram.manage.v1.projects.list();
    const project = projectsResponse?.projects?.[0];

    if (!project || !project.project_id) {
      return NextResponse.json(
        { error: "No Deepgram project found" },
        { status: 404 }
      );
    }

    // Create a temporary key that expires in 1 hour
    const result = await deepgram.manage.v1.projects.keys.create(
      project.project_id,
      {
        comment: "Ephemeral Key for Client",
        scopes: ["usage:write"],
        time_to_live_in_seconds: 3600,
      }
    );

    if (!result || !result.key) {
      console.error("Deepgram key creation error: no key returned");
      return NextResponse.json({ error: "Failed to generate Deepgram key" }, { status: 500 });
    }

    return NextResponse.json({ key: result.key, projectId: project.project_id });
  } catch (err: any) {
    console.error("Deepgram API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
