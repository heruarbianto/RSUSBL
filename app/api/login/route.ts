import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/app/fungsi/general";

// SECRET KEY buat tanda tangan JWT
const JWT_SECRET = process.env.JWT_SECRET!;

export const POST = async (request: NextRequest) => {
  try {
    // Ambil data dari request body
    const { loginValue, passwordValue } = await request.json();
    const email= "q";
    const password ="q";
    // const email= "admin@gmail.com";
    // const password ="pass123";
    // Validasi data kosong
    if (!loginValue || !passwordValue) {
      return NextResponse.json(
        {
          metadata: {
            error: 1,
            message: "Username/email dan password wajib diisi.",
          },
        },
        { status: 200 }
      );
    }



    if (email !== loginValue || password!==passwordValue) {
      return NextResponse.json(
        {
          metadata: {
            error: 1,
            message: "email/password Salah",
          },
        },
        { status: 200 }
      );
    }


    // Generate JWT Token
    const token = jwt.sign(
      {
        email: email,
        role:"ADMIN",
      },
      JWT_SECRET,
      { expiresIn: "1m" } // token valid selama 8 jam
    );
    const isSecure =
      process.env.NODE_ENV === "production" ||
      request.headers.get("x-forwarded-proto") === "https";

    // cookies.("token", token, {
    //   httpOnly: true,
    //   secure: isSecure,
    //   sameSite: "lax",
    //   maxAge: 60 * 60 * 8,
    //   path: "/",
    // });

    const response = NextResponse.json(
      {
        metadata: {
          error: 0,
          message: "Login berhasil",
        },
        user: {

          email: email,
          role:"ADMIN",
        },
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      {
        metadata: { error: 1, message: "Terjadi kesalahan server" },
        detail: error.message || error.toString(),
      },
      { status: 500 }
    );
  }
};
