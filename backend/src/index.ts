import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { fetchNotionItems, createNotionPage, createNotionPagesBatch, updateNotionPageStatus } from "./notion";
import { ALLOWED_EMAIL, decodeGoogleIdToken, verifyGoogleTokenWithApi } from "./auth";
import { generateMangaPreview } from "./mangaEnricher";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-anime-notion-vault-2026";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim() || "";

// Reusable auth verification helper
async function verifyAuth(headers: Record<string, string | undefined>, auth_token: any, jwt: any, set: any) {
  const authHeader = headers["authorization"];
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : auth_token?.value;

  if (!token) {
    set.status = 401;
    return { ok: false, error: "Autentikasi diperlukan. Silakan login dengan akun Google Anda terlebih dahulu." };
  }

  const payload = (await jwt.verify(token)) as any;
  if (!payload || !payload.email || payload.email.toLowerCase() !== ALLOWED_EMAIL) {
    set.status = 403;
    return { ok: false, error: `Akses ditolak. Hanya ${ALLOWED_EMAIL} yang diizinkan.` };
  }

  return { ok: true, payload };
}

const app = new Elysia()
  .use(
    cors({
      origin: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    })
  )
  .use(
    jwt({
      name: "jwt",
      secret: JWT_SECRET,
      exp: "30d",
    })
  )
  .get("/", () => ({
    name: "Anime & Manhwa Notion Backend API",
    status: "ok",
    version: "1.0.0",
    allowedEmail: ALLOWED_EMAIL,
  }))

  // Status check for Notion credentials
  .get("/api/status", () => {
    const hasKey = Boolean(process.env.NOTION_API_KEY?.trim());
    const hasDbId = Boolean(process.env.NOTION_DATABASE_ID?.trim());

    return {
      isConfigured: hasKey && hasDbId,
      hasKey,
      hasDatabaseId: hasDbId,
      message: hasKey && hasDbId ? "success" : "error",
    };
  })

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================

  // Google Login Endpoint
  .post(
    "/api/auth/google",
    async ({ body, jwt, cookie: { auth_token }, set }) => {
      const { credential } = body as { credential?: string };

      if (!credential) {
        set.status = 400;
        return {
          success: false,
          message: "Token Google (credential) tidak ditemukan.",
        };
      }

      // Try verifying with Google TokenInfo API, or decode payload
      let tokenData = await verifyGoogleTokenWithApi(credential);
      if (!tokenData) {
        tokenData = decodeGoogleIdToken(credential);
      }

      if (!tokenData || !tokenData.email) {
        set.status = 401;
        return {
          success: false,
          message: "Token Google tidak valid atau gagal didekode.",
        };
      }

      const userEmail = tokenData.email.toLowerCase().trim();

      // STRICT CHECK: Hanya email ALLOWED_EMAIL yang boleh masuk!
      if (userEmail !== ALLOWED_EMAIL) {
        console.warn(`[AUTH] Akses ditolak untuk email: ${userEmail}.`);
        set.status = 403;
        return {
          success: false,
          isBlocked: true,
          message: `Akses ditolak: Akun '${userEmail}' tidak memiliki izin.`,
        };
      }

      // Sign JWT session token with 30 days session
      const sessionToken = await jwt.sign({
        email: userEmail,
        name: tokenData.name || userEmail.split("@")[0],
        picture: tokenData.picture || "",
      });

      // Set HTTP session cookie (30 days)
      auth_token.set({
        value: sessionToken,
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      });

      console.log(`[AUTH] Login berhasil untuk akun: ${userEmail}`);

      return {
        success: true,
        token: sessionToken,
        user: {
          email: userEmail,
          name: tokenData.name || userEmail.split("@")[0],
          picture: tokenData.picture || "",
        },
      };
    },
    {
      body: t.Object({
        credential: t.String(),
      }),
    }
  )

  // Logout Endpoint
  .post("/api/auth/logout", ({ cookie: { auth_token } }) => {
    auth_token.remove();
    return { success: true, message: "Sesi logout berhasil." };
  })

  // Dev Quick Login (untuk kemudahan testing via HP / local network)
  .post(
    "/api/auth/dev-login",
    async ({ body, jwt, cookie: { auth_token }, set }) => {
      // Tolak jika sedang berjalan di mode production
      if (process.env.NODE_ENV === "production") {
        set.status = 403;
        return {
          success: false,
          isBlocked: true,
          message: "Akses masuk cepat (dev-login) dinonaktifkan di mode production.",
        };
      }

      const { email } = (body || {}) as { email?: string };
      const targetEmail = (email || ALLOWED_EMAIL).toLowerCase().trim();

      // Strict check: if email is not allowed, reject with 403!
      if (targetEmail !== ALLOWED_EMAIL) {
        set.status = 403;
        return {
          success: false,
          isBlocked: true,
          message: `Akses ditolak: Akun '${targetEmail}' tidak memiliki izin. Hanya pemilik (${ALLOWED_EMAIL}) yang dapat masuk ke vault ini.`,
        };
      }

      const sessionToken = await jwt.sign({
        email: ALLOWED_EMAIL,
        name: "Arya Dzaky",
        picture: "https://lh3.googleusercontent.com/aida-public/AB6AXuDixMSYgCrD8QKhI1_qtBAQMD3PXlJzP8Kd5dNYfebZydA37Q7zDlF-JaHb2lnXupXz-xKq_Ja8JV8YoB0CO0emQwqxLrLaoK8SjCQ8u_Fsvwvmz6AGRYWYt87uI-bNLQYM9kJVKEndVV5hIoM3HdAxnoxCrBDFsSyb1qV5RsS-U-T9CtcdiiRmWXgz-G4-d_w93ruZrra5yfjChTtwhe3JyPczT4dEAsMqhYMRVbBPiT__6t3wdTW7OLZEgVehcVIh9Es",
      });

      auth_token.set({
        value: sessionToken,
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      });

      return {
        success: true,
        token: sessionToken,
        user: {
          email: ALLOWED_EMAIL,
          name: "Arya Dzaky",
          picture: "",
        },
      };
    },
    {
      body: t.Optional(
        t.Object({
          email: t.Optional(t.String()),
        })
      ),
    }
  )

  // Get current user profile
  .get("/api/auth/me", async ({ headers, cookie: { auth_token }, jwt, set }) => {
    const authHeader = headers["authorization"];
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : auth_token?.value;

    if (!token) {
      set.status = 401;
      return { success: false, message: "Token otentikasi tidak ditemukan." };
    }

    const payload = (await jwt.verify(token)) as any;

    if (!payload || !payload.email || payload.email.toLowerCase() !== ALLOWED_EMAIL) {
      set.status = 401;
      return { success: false, message: "Sesi tidak valid atau telah kedaluwarsa." };
    }

    return {
      success: true,
      user: {
        email: payload.email,
        name: payload.name || payload.email.split("@")[0],
        picture: payload.picture || "",
      },
    };
  })

  // ==========================================
  // PROTECTED NOTION API ROUTES
  // ==========================================

  // Fetch all items from Notion database (Protected)
  .get("/api/items", async ({ headers, cookie: { auth_token }, jwt, set }) => {
    const authHeader = headers["authorization"];
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : auth_token?.value;

    if (!token) {
      set.status = 401;
      return {
        success: false,
        message: "Autentikasi diperlukan. Silakan login dengan akun Google Anda terlebih dahulu.",
      };
    }

    const payload = (await jwt.verify(token)) as any;

    if (!payload || !payload.email || payload.email.toLowerCase() !== ALLOWED_EMAIL) {
      set.status = 403;
      return {
        success: false,
        message: `Akses ditolak. Hanya ${ALLOWED_EMAIL} yang diizinkan mengakses data katalog ini.`,
      };
    }

    return await fetchNotionItems();
  })

  // Fetch single item by ID (Protected)
  .get("/api/items/:id", async ({ params, headers, cookie: { auth_token }, jwt, set }) => {
    const authHeader = headers["authorization"];
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : auth_token?.value;

    if (!token) {
      set.status = 401;
      return {
        success: false,
        message: "Autentikasi diperlukan. Silakan login dengan akun Google Anda terlebih dahulu.",
      };
    }

    const payload = (await jwt.verify(token)) as any;

    if (!payload || !payload.email || payload.email.toLowerCase() !== ALLOWED_EMAIL) {
      set.status = 403;
      return {
        success: false,
        message: `Akses ditolak. Hanya ${ALLOWED_EMAIL} yang diizinkan.`,
      };
    }

    const res = await fetchNotionItems();
    const item = res.data.find((it) => it.id === params.id);
    if (!item) {
      return {
        success: false,
        message: `Item dengan ID ${params.id} tidak ditemukan.`,
        data: null,
      };
    }
    return {
      success: true,
      data: item,
    };
  })

  // Generate manga/manhwa preview from pasted text or links (Protected)
  .post(
    "/api/manga/preview",
    async ({ body, headers, cookie: { auth_token }, jwt, set }) => {
      const auth = await verifyAuth(headers, auth_token, jwt, set);
      if (!auth.ok) return { success: false, message: auth.error };

      const { rawText, typeHint } = body as { rawText?: string; typeHint?: string };
      if (!rawText || !rawText.trim()) {
        return {
          success: false,
          message: "Teks atau daftar judul komik/anime tidak boleh kosong.",
          data: [],
        };
      }

      console.log(`[ENRICHER] Memproses preview untuk input teks (${rawText.length} karakter, hint: ${typeHint || "auto"})...`);
      const items = await generateMangaPreview(rawText, typeHint);

      return {
        success: true,
        count: items.length,
        data: items,
      };
    },
    {
      body: t.Object({
        rawText: t.String(),
        typeHint: t.Optional(t.String()),
      }),
    }
  )

  // Save single item to Notion database (Protected)
  .post(
    "/api/items",
    async ({ body, headers, cookie: { auth_token }, jwt, set }) => {
      const auth = await verifyAuth(headers, auth_token, jwt, set);
      if (!auth.ok) return { success: false, message: auth.error };

      try {
        const item = await createNotionPage(body);
        return {
          success: true,
          message: `Berhasil menambahkan "${item.title}" ke Notion.`,
          data: item,
        };
      } catch (err: any) {
        set.status = 500;
        return {
          success: false,
          message: err?.message || "Gagal menyimpan entri ke Notion.",
        };
      }
    }
  )

  // Save batch items to Notion database (Protected)
  .post(
    "/api/items/batch",
    async ({ body, headers, cookie: { auth_token }, jwt, set }) => {
      const auth = await verifyAuth(headers, auth_token, jwt, set);
      if (!auth.ok) return { success: false, message: auth.error };

      const { items } = body as { items?: any[] };
      if (!Array.isArray(items) || items.length === 0) {
        set.status = 400;
        return {
          success: false,
          message: "Daftar entri yang dipilih kosong.",
          count: 0,
          created: [],
        };
      }

      console.log(`[NOTION] Menyimpan batch ${items.length} komik ke Notion...`);
      const result = await createNotionPagesBatch(items);

      return {
        success: result.success,
        count: result.created.length,
        created: result.created,
        errors: result.errors,
        message:
          result.errors.length === 0
            ? `Berhasil menyimpan semua (${result.created.length}) komik ke database Notion!`
            : `Tersimpan ${result.created.length} dari ${items.length} komik. ${result.errors.length} gagal disimpan.`,
      };
    },
    {
      body: t.Object({
        items: t.Array(t.Any()),
      }),
    }
  )

  // Update item status in Notion (Protected)
  .patch(
    "/api/items/:id",
    async ({ params, body, headers, cookie: { auth_token }, jwt, set }) => {
      const auth = await verifyAuth(headers, auth_token, jwt, set);
      if (!auth.ok) return { success: false, message: auth.error };

      const { status } = body as { status?: string };
      if (!status) {
        set.status = 400;
        return { success: false, message: "Field 'status' wajib diisi." };
      }

      try {
        console.log(`[NOTION] Mengubah status item ${params.id} menjadi "${status}"...`);
        const updatedItem = await updateNotionPageStatus(params.id, status);
        return {
          success: true,
          message: `Status berhasil diubah menjadi "${status}".`,
          data: updatedItem,
        };
      } catch (err: any) {
        set.status = 500;
        return {
          success: false,
          message: err?.message || "Gagal mengubah status di Notion.",
        };
      }
    },
    {
      body: t.Object({
        status: t.String(),
      }),
    }
  );

// Only listen on TCP port in standalone / local development (Vercel Serverless handles execution automatically)
if (!process.env.VERCEL) {
  app.listen({
    port: PORT,
    hostname: "0.0.0.0",
  });
  console.log(
    `🦊 Elysia backend is running at http://${app.server?.hostname || "localhost"}:${app.server?.port || PORT}`
  );
  console.log(`🔒 Authentication active: Only '${ALLOWED_EMAIL}' is granted access.`);
}

export default app;
