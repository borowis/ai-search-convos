export async function POST(
  request: Request
) {
  const body = await request.json();
  const { query } = body;
  console.log(">>>>> query " + query)
}