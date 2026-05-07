import { getResponseNotFound, prisma } from "@/app/fungsi/general";
import { verifyAdminJWT } from "@/utils/verifyJWT";
import { NextRequest, NextResponse } from "next/server";

//    Buat Get API tampilkan semua data Dokumen
export const GET = async (request: NextRequest) => {
      // Verifikasi token
  const decoded: any = await verifyAdminJWT();

  // Jika gagal, decoded akan jadi Response (dari middleware)
  if (decoded instanceof Response) return decoded;
  // ambil data dari database
  const view = await prisma.KARYAWAN.findMany({
    
});

  // jika data tidak ada apa aja
  if (view.length == 0) {
    // tampilkan respon api
    return getResponseNotFound();
  }
  // tampilkan respon api
  return NextResponse.json(
    {
      metadata: {
        error: 0,
        message: null,
      },
      datakaryawan: view,
    },
    {
      status: 200,
    }
  );
};



export const POST = async (request: NextRequest) => {
  const decoded: any = await verifyAdminJWT();
  if (decoded instanceof Response) return decoded;

  const body = await request.json();

  const Nama = body.Nama?.trim();
  const Tgl_Lahir = body.Tgl_Lahir;
  const Gaji = body.Gaji;

  const errors: { field: string; message: string }[] = [];

  if (!Nama) {
    errors.push({ field: "Nama", message: "Nama wajib diisi" });
  }

  if (!Tgl_Lahir) {
    errors.push({ field: "Tgl_Lahir", message: "Tanggal lahir wajib diisi" });
  }

  const parsedDate = new Date(Tgl_Lahir);
  if (Tgl_Lahir && isNaN(parsedDate.getTime())) {
    errors.push({ field: "Tgl_Lahir", message: "Format tanggal tidak valid" });
  }

  const parsedGaji = Number(Gaji);
  if (!Gaji) {
    errors.push({ field: "Gaji", message: "Gaji wajib diisi" });
  } else if (isNaN(parsedGaji) || parsedGaji <= 0) {
    errors.push({ field: "Gaji", message: "Gaji harus berupa angka valid" });
  }

  if (errors.length > 0) {
    return NextResponse.json(
      {
        metadata: {
          error: 1,
          message: "Validasi gagal",
        },
        errors,
      },
      { status: 400 }
    );
  }

  const create = await prisma.KARYAWAN.create({
    data: {
      Nama,
      Tgl_Lahir: parsedDate,
      Gaji: parsedGaji,
    },
  });

  return NextResponse.json({
    metadata: {
      error: 0,
      message: "Data karyawan berhasil ditambahkan",
    },
    data: create,
  });
};