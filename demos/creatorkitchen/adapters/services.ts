export interface StorageProgress {
  loaded: number;
  total: number;
}
const uploads = new Set<string>();
export async function uploadFile(
  file: unknown,
  progress?: (value: StorageProgress) => void,
): Promise<string> {
  if (!(file instanceof File)) throw new Error('Choose a file to upload.');
  const url = URL.createObjectURL(file);
  uploads.add(url);
  progress?.({ loaded: file.size, total: file.size });
  return url;
}
export function installFixtureFetch(): void {
  window.fetch = async (input: RequestInfo | URL): Promise<Response> => {
    const url = new URL(
      input instanceof Request ? input.url : String(input),
      window.location.href,
    );
    if (url.pathname === '/api/unsplash') return Response.json({ results: [] });
    if (url.pathname === '/api/giphy')
      return Response.json({ results: { data: [] } });
    throw new Error(
      'That external service is unavailable in this archived demo.',
    );
  };
  window.addEventListener('pagehide', () => {
    for (const url of uploads) URL.revokeObjectURL(url);
  });
}
