// Imagem Open Graph 1200×630, gerada no build (src/components/seo/og.ts).
import type { APIRoute } from 'astro';
import { gerarOg } from '../../components/seo/og.ts';

export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await gerarOg()), { headers: { 'Content-Type': 'image/jpeg' } });
