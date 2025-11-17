export async function pinFileToIPFS(
  file: File, 
  options?: {
    // credentials are no longer read on the client; kept for backward compatibility but ignored
    jwt?: string;
    apiKey?: string;
    secretKey?: string;
  }
): Promise<{ cid: string }> {
  const form = new FormData();
  form.append("file", file);

  // 将上传请求转发到服务端路由，避免在前端暴露任何凭据
  // 注意：使用 FormData 时，不要手动设置 Content-Type，让浏览器自动设置
  const res = await fetch("/api/pinata/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Pinata upload failed: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return { cid: data.cid };
}
