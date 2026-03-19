import { processStatements } from "@/services/statement.service";

export async function POST(req) {
  try {
    const body = await req.json();

    const result = await processStatements(body);

    return Response.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    return Response.json({
      success: false,
      error: err.message
    });
  }
}