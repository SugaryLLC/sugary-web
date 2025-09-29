// lib/upload.ts
export async function uploadAvatarFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  // POST to your API route or direct upload endpoint
  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();

  // Expect your API to return: { path: "ProfilePic/uploaded_file.png" }
  return data.path;
}
