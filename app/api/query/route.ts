import { client } from "@gradio/client";

export async function POST(
  request: Request
) {
  const body = await request.json();
  const { query } = body;
  console.log("Query: " + query);

  try {

    const app = await client("https://914279084c0d3949fa.gradio.live/");
    const result = await app.predict("/predict", [
      "You're Help Scout support agent, you're always answering questions politely, comprehensively and concisely. If you're not sure about the answer please ask for more details.", // string  in 'Instruction' Textbox component
      query, // string  in 'Input' Textbox component
      0.1, // number (numeric value between 0 and 1) in 'Temperature' Slider component		
      0.75, // number (numeric value between 0 and 1) in 'Top p' Slider component		
      10, // number (numeric value between 0 and 100) in 'Top k' Slider component
      1, // number (numeric value between 1 and 4) in 'Beams' Slider component
      100, // number (numeric value between 1 and 2000) in 'Max tokens' Slider component
      false, // boolean  in 'Stream output' Checkbox component
    ]);

    return new Response(result.data, {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache, no-transform",
      },
    });

  } catch (err) {
    console.error(err);
    let error = "Unexpected message";
    if (err instanceof Error) {
      error = err.message;
    }
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

}