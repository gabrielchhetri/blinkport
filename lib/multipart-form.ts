export async function parseMultipartFormData(body: Buffer, request: Request): Promise<FormData> {
  const contentType = request.headers.get("content-type");
  if (!contentType) throw new TypeError("Missing multipart content type.");

  // Multipart boundaries are case-sensitive, so preserve the original header value.
  return new Response(new Uint8Array(body), { headers: { "content-type": contentType } }).formData();
}
