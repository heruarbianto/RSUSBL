import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function verifyJWT() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new Error("TOKEN_NOT_FOUND");
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    return decoded;

  } catch (error: any) {
    throw new Error("INVALID_TOKEN");
  }
}


// Fungsi ini khusus untuk memverifikasi token dan memastikan user adalah admin
export async function verifyAdminJWT() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new Error("TOKEN_NOT_FOUND");
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "ADMIN") {
      throw new Error("FORBIDDEN");
    }

    return decoded;

  } catch (error: any) {
    throw error;
  }
}
