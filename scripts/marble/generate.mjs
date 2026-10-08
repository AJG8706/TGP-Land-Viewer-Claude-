#!/usr/bin/env node
// Generates Marble worlds for the lots listed in worlds/plan.json.
//
//   node scripts/marble/generate.mjs estimate         free: checks inputs, prices each world, shows balance
//   node scripts/marble/generate.mjs run <lot>/<a|b>  spends credits on one world
//
// Reads the API key from WLT_API_KEY (WORLDLABS_API_ORIGIN overrides the
// API host, e.g. for a local mock). Each world is saved to
// worlds/<lot>/<variant>/ as world.json plus its splats, pano and thumbnail.
// Meshes are never downloaded and the paid HQ mesh export is never requested.

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API = `${process.env.WORLDLABS_API_ORIGIN || 'https://api.worldlabs.ai'}/marble/v1`;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PLAN = path.join(ROOT, 'worlds/plan.json');
const POLL_MS = 10_000;
const TIMEOUT_MS = 45 * 60_000;

// https://docs.worldlabs.ai/api/pricing — standard models only; marble-1.1-plus
// adds a variable charge that cannot be known before the run.
const PRICED_MODELS = ['marble-1.0', 'marble-1.1'];
const CREDITS = { world: 1500, panoFromImage: 80, panoFromMultiImage: 100 };
const MAX_MULTI_IMAGES = 8;

const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

async function api(method, endpoint, body) {
  const key = process.env.WLT_API_KEY;
  if (!key) throw new Error('WLT_API_KEY is not set in this environment.');
  const res = await fetch(API + endpoint, {
    method,
    headers: { 'WLT-Api-Key': key, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${endpoint} -> ${res.status}: ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : {};
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

// Reads pixel dimensions from a JPEG SOF marker or a PNG IHDR chunk.
function imageSize(buf) {
  if (buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  let i = 2;
  while (i + 9 < buf.length && buf[i] === 0xff) {
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

function priceOf(world, model) {
  if (!PRICED_MODELS.includes(model)) throw new Error(`No fixed price for model ${model}.`);
  const pano = world.inputs.length > 1 ? CREDITS.panoFromMultiImage : CREDITS.panoFromImage;
  return pano + CREDITS.world;
}

async function checkInputs(world) {
  const problems = [];
  const sizes = [];
  for (const rel of world.inputs) {
    const file = path.join(ROOT, rel);
    if (!(await exists(file))) {
      problems.push(`missing ${rel}`);
      continue;
    }
    const ext = path.extname(file).slice(1).toLowerCase();
    if (!MIME[ext]) problems.push(`unsupported type ${rel}`);
    const size = imageSize(await readFile(file));
    sizes.push(size ? `${size.width}x${size.height}` : 'unknown');
  }
  if (world.inputs.length > MAX_MULTI_IMAGES) {
    problems.push(`${world.inputs.length} images; reconstruction takes at most ${MAX_MULTI_IMAGES}`);
  }
  // Auto layout requires every image to share one resolution.
  if (world.inputs.length > 1 && new Set(sizes).size > 1) {
    problems.push(`mixed resolutions: ${[...new Set(sizes)].join(', ')}`);
  }
  return { problems, sizes };
}

async function loadPlan() {
  return JSON.parse(await readFile(PLAN, 'utf8'));
}

async function balance() {
  const { remaining_credits } = await api('GET', '/credits');
  return remaining_credits;
}

async function estimate() {
  const plan = await loadPlan();
  let total = 0;
  for (const world of plan.worlds) {
    const credits = priceOf(world, plan.model);
    const done = await exists(path.join(ROOT, 'worlds', world.id, 'world.json'));
    const { problems, sizes } = await checkInputs(world);
    const status = done ? 'already generated' : problems.length ? problems.join('; ') : 'ready';
    if (!done) total += credits;
    console.log(`${world.id.padEnd(22)} ${String(world.inputs.length).padStart(2)} image(s) ${String(credits).padStart(5)} credits  ${status}`);
    if (sizes.length) console.log(`${''.padEnd(22)} ${[...new Set(sizes)].join(', ')}`);
  }
  console.log(`\nModel ${plan.model}. Remaining worlds total: ${total} credits ($${(total / 1250).toFixed(2)}).`);
  try {
    console.log(`API balance: ${await balance()} credits.`);
  } catch (err) {
    console.log(`API balance unavailable: ${err.message}`);
  }
}

async function upload(rel) {
  const file = path.join(ROOT, rel);
  const ext = path.extname(file).slice(1).toLowerCase();
  const { media_asset, upload_info } = await api('POST', '/media-assets:prepare_upload', {
    file_name: path.basename(file),
    extension: ext,
    kind: 'image',
  });
  const res = await fetch(upload_info.upload_url, {
    method: upload_info.upload_method || 'PUT',
    headers: { 'Content-Type': MIME[ext], ...upload_info.required_headers },
    body: await readFile(file),
  });
  if (!res.ok) throw new Error(`Upload of ${rel} failed: ${res.status} ${await res.text()}`);
  return media_asset.media_asset_id;
}

function worldPrompt(assetIds) {
  if (assetIds.length === 1) {
    return {
      type: 'image',
      image_prompt: { source: 'media_asset', media_asset_id: assetIds[0] },
      is_pano: 'auto',
    };
  }
  return {
    type: 'multi-image',
    multi_image_prompt: assetIds.map((id) => ({ content: { source: 'media_asset', media_asset_id: id } })),
    reconstruct_images: true,
  };
}

async function waitFor(operationId) {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    const op = await api('GET', `/operations/${operationId}`);
    if (op.error) throw new Error(`Generation failed: ${JSON.stringify(op.error)}`);
    if (op.done) return op;
    const progress = op.metadata?.progress ?? op.metadata?.progress_percentage;
    console.log(`  waiting${progress !== undefined ? ` (${JSON.stringify(progress)})` : ''}...`);
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  throw new Error(`Operation ${operationId} still running after ${TIMEOUT_MS / 60_000} min; resume by polling it.`);
}

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download of ${url} failed: ${res.status}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
}

function extOf(url, fallback) {
  return path.extname(new URL(url).pathname) || fallback;
}

async function run(id) {
  const plan = await loadPlan();
  const world = plan.worlds.find((w) => w.id === id);
  if (!world) throw new Error(`No world ${id} in worlds/plan.json.`);
  const outDir = path.join(ROOT, 'worlds', id);
  if (await exists(path.join(outDir, 'world.json'))) throw new Error(`${id} is already generated.`);

  const { problems } = await checkInputs(world);
  if (problems.length) throw new Error(`${id}: ${problems.join('; ')}`);
  const credits = priceOf(world, plan.model);
  // The API admits requests that overdraw the balance and bills the overage later.
  const available = await balance();
  if (available < credits) throw new Error(`Balance ${available} is below the ${credits} credits ${id} costs.`);

  console.log(`Uploading ${world.inputs.length} image(s) for ${id}...`);
  const assetIds = [];
  for (const rel of world.inputs) assetIds.push(await upload(rel));

  const started = await api('POST', '/worlds:generate', {
    display_name: world.display_name,
    model: plan.model,
    world_prompt: worldPrompt(assetIds),
    tags: ['tgp', id.split('/')[0]],
  });
  console.log(`Started operation ${started.operation_id}.`);
  const op = await waitFor(started.operation_id);
  const result = op.response;

  await mkdir(outDir, { recursive: true });
  const assets = result.assets ?? {};
  if (assets.thumbnail_url) await download(assets.thumbnail_url, path.join(outDir, `thumbnail${extOf(assets.thumbnail_url, '.webp')}`));
  if (assets.imagery?.pano_url) await download(assets.imagery.pano_url, path.join(outDir, `pano${extOf(assets.imagery.pano_url, '.png')}`));
  for (const [resolution, url] of Object.entries(assets.splats?.spz_urls ?? {})) {
    await download(url, path.join(outDir, `splat-${resolution}.spz`));
  }
  await writeFile(
    path.join(outDir, 'world.json'),
    JSON.stringify({ plan: world, model: plan.model, operation_id: started.operation_id, cost: op.cost, world: result }, null, 2) + '\n',
  );

  console.log(`\n${id} done. Cost: ${op.cost?.total_credits ?? 'not reported'} credits.`);
  console.log(`Marble viewer: ${result.world_marble_url}`);
}

const [command, arg] = process.argv.slice(2);
const commands = { estimate: () => estimate(), run: () => run(arg) };
if (!commands[command] || (command === 'run' && !arg)) {
  console.error('Usage: generate.mjs estimate | run <lot>/<a|b>');
  process.exit(2);
}
commands[command]().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
