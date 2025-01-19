import { list } from '@vercel/blob';

/*
  Docs: https://nextjs.org/docs/app/building-your-application/optimizing/videos
*/
export async function VideoComponent({ fileName }) {
  const { blobs } = await list({
    prefix: fileName,
    limit: 2,
  });
  const { url } = blobs[0];
  const { url: captionsUrl } = blobs[1];

  return (
    <video controls preload="none" aria-label="Video player">
      <source src={url} type="video/mp4" />
      <track src={captionsUrl} kind="subtitles" srcLang="en" label="English" />
      Your browser does not support the video tag.
    </video>
  );
}
