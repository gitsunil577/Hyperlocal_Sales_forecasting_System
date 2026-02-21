import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to .env.local");
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// ---------------------------------------------------------------------------
// DNS-over-HTTPS helpers (bypasses port-53 blocks common on Windows)
// Uses Cloudflare's DoH API on port 443 to resolve MongoDB Atlas SRV records
// ---------------------------------------------------------------------------

interface DoHAnswer {
  type: number;
  data: string;
}

async function resolveSrvDoH(hostname: string) {
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=SRV`,
    { headers: { Accept: "application/dns-json" } }
  );
  const json = (await res.json()) as { Answer?: DoHAnswer[] };
  return (json.Answer ?? [])
    .filter((r) => r.type === 33)
    .map((r) => {
      const [priority, weight, port, ...nameParts] = r.data.split(" ");
      return {
        priority: parseInt(priority),
        weight: parseInt(weight),
        port: parseInt(port),
        name: nameParts.join(" ").replace(/\.$/, ""),
      };
    });
}

async function resolveTxtDoH(hostname: string): Promise<string> {
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=TXT`,
    { headers: { Accept: "application/dns-json" } }
  );
  const json = (await res.json()) as { Answer?: DoHAnswer[] };
  return (json.Answer ?? [])
    .filter((r) => r.type === 16)
    .map((r) => r.data.replace(/^"|"$/g, ""))
    .join("&");
}

// Convert mongodb+srv:// → mongodb:// using DoH-resolved hosts
async function srvToDirectUri(srvUri: string): Promise<string> {
  const match = srvUri.match(
    /^mongodb\+srv:\/\/([^:@]+):([^@]+)@([^/?]+)(.*)/
  );
  if (!match) return srvUri;

  const [, user, pass, host, rest] = match;

  try {
    const [srvRecords, txtOptions] = await Promise.all([
      resolveSrvDoH(`_mongodb._tcp.${host}`),
      resolveTxtDoH(host),
    ]);

    if (!srvRecords.length) {
      console.warn("[mongodb] DoH returned no SRV records, using original URI");
      return srvUri;
    }

    const hosts = srvRecords
      .sort((a, b) => a.priority - b.priority || b.weight - a.weight)
      .map((r) => `${r.name}:${r.port}`)
      .join(",");

    // Merge TXT options with any existing query params
    const restHasQuery = rest.includes("?");
    const extraOpts = `tls=true${txtOptions ? `&${txtOptions}` : ""}`;
    const sep = restHasQuery ? "&" : "?";

    const directUri = `mongodb://${user}:${pass}@${hosts}${rest}${sep}${extraOpts}`;
    console.log("[mongodb] Resolved to direct URI via DoH");
    return directUri;
  } catch (err) {
    console.warn("[mongodb] DoH SRV resolution failed, falling back to SRV URI:", err);
    return srvUri;
  }
}

async function createClientPromise(): Promise<MongoClient> {
  const rawUri = process.env.MONGODB_URI!;
  const uri = rawUri.startsWith("mongodb+srv://")
    ? await srvToDirectUri(rawUri)
    : rawUri;
  const client = new MongoClient(uri);
  return client.connect();
}

// Singleton — reuse across hot reloads in dev
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = createClientPromise();
}

export default clientPromise;
