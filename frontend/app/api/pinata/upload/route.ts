import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // Prefer API Key + Secret; fallback to JWT
    const apiKey = process.env.PINATA_API_KEY?.trim();
    const secretKey = process.env.PINATA_SECRET_KEY?.trim();
    const jwt = process.env.PINATA_JWT?.trim();

    let headers: HeadersInit = {};
    if (apiKey && secretKey) {
      headers = {
        pinata_api_key: apiKey,
        pinata_secret_api_key: secretKey,
      };
    } else if (jwt) {
      headers = {
        Authorization: `Bearer ${jwt}`,
      };
    } else {
      return NextResponse.json(
        { error: "Pinata credentials missing on server" },
        { status: 500 }
      );
    }

    const forward = new FormData();
    forward.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers,
      body: forward,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Pinata upload failed: ${res.status} ${text}` },
        { status: 502 }
      );
    }

    const json = await res.json();
    return NextResponse.json({ cid: json.IpfsHash });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}


