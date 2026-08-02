import {
    NextResponse,
  } from "next/server";
  
  export const dynamic =
    "force-dynamic";
  
  export async function GET() {
    const key =
      process.env.INDEXNOW_KEY?.trim();
  
    if (!key) {
      return new NextResponse(
        "IndexNow key is not configured.",
        {
          status: 404,
  
          headers: {
            "Content-Type":
              "text/plain; charset=utf-8",
  
            "Cache-Control":
              "no-store",
          },
        }
      );
    }
  
    return new NextResponse(
      key,
      {
        status: 200,
  
        headers: {
          "Content-Type":
            "text/plain; charset=utf-8",
  
          "Cache-Control":
            "public, max-age=300, s-maxage=300",
        },
      }
    );
  }
  