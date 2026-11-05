import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { blueprints, finalizedCount } = body;

    const filePath = path.join(process.cwd(), "scripts", "merchant_selected_screen_blueprints.json");
    
    const dataToSave = {
      timestamp: new Date().toISOString(),
      finalizedCount: finalizedCount || Object.keys(blueprints || {}).length,
      totalScreens: 56,
      blueprints: blueprints || {},
    };

    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      message: "Finalized screen blueprints successfully saved to project!",
      path: filePath,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "scripts", "merchant_selected_screen_blueprints.json");
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return NextResponse.json({ success: true, ...data });
    }
    return NextResponse.json({ success: true, blueprints: {}, finalizedCount: 0 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
