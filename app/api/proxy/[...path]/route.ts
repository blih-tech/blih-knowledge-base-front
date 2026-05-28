import { NextResponse, type NextRequest } from "next/server";
import { AxiosError } from "axios";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { backendAxios } from "@/lib/api/axios";

const HOP_BY_HOP = new Set([
  "host",
  "connection",
  "content-length",
  "accept-encoding",
  "cookie",
  "authorization",
]);

type RouteContext = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.error === "RefreshAccessTokenError") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { path } = await context.params;
  const upstreamPath = `/${path.join("/")}`;
  const search = request.nextUrl.search;

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers[key] = value;
  });
  if (session.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  let body: unknown = undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const text = await request.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
  }

  try {
    const upstream = await backendAxios.request({
      url: `${upstreamPath}${search}`,
      method: request.method as
        | "GET"
        | "POST"
        | "PUT"
        | "PATCH"
        | "DELETE",
      headers,
      data: body,
      validateStatus: () => true,
    });
    return NextResponse.json(upstream.data, { status: upstream.status });
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      return NextResponse.json(err.response.data, {
        status: err.response.status,
      });
    }
    return NextResponse.json(
      { message: "Upstream request failed" },
      { status: 502 },
    );
  }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
