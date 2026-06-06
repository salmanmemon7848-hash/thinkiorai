import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, acquireSlot, releaseSlot, incrementGlobalDaily } from "@/lib/rateLimit";
import {
  deepResearch,
  researchForReport,
  deepDiveResearch,
} from "@/lib/research/deepResearch";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();
    const plan = profile?.plan ?? "free";

    // ── Global rate limit (concurrency + cooldown + daily cap) ──
    const rateCheck = await checkRateLimit(user.id, plan, supabase);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "rate_limited", code: rateCheck.code, message: rateCheck.message },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { query, mode = "standard", topics } = body;

    if (!query && !topics?.length) {
      return NextResponse.json(
        { error: "Query or topics required" },
        { status: 400 }
      );
    }

    acquireSlot(user.id);
    let result;
    try {
      if (mode === "report" && topics?.length) {
        result = await researchForReport(topics);
      } else if (mode === "deep") {
        result = await deepDiveResearch(query);
      } else {
        result = await deepResearch(query, { depth: "standard" });
      }
    } finally {
      releaseSlot(user.id);
    }

    await incrementGlobalDaily(user.id, supabase);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Research failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
