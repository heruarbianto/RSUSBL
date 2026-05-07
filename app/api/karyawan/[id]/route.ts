import { getResponseNotFound, prisma } from "@/app/fungsi/general";
import { verifyAdminJWT } from "@/utils/verifyJWT";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const decoded: any = await verifyAdminJWT();
  if (decoded instanceof Response) return decoded;

  const { id } = await params;
  const parsedId = Number(id);

  if (!parsedId || isNaN(parsedId)) {
    return NextResponse.json(
      {
        metadata: { error: 1, message: "ID tidak valid" },
      },
      { status: 400 }
    );
  }

  const body = await request.json();

  const Nama = body.Nama?.trim();
  const Tgl_Lahir = body.Tgl_Lahir;
  const Gaji = body.Gaji;

  const errors: { field: string; message: string }[] = [];

  if (Nama !== undefined && Nama === "") {
    errors.push({ field: "Nama", message: "Nama tidak boleh kosong" });
  }

  let parsedDate: Date | undefined;
  if (Tgl_Lahir !== undefined) {
    parsedDate = new Date(Tgl_Lahir);
    if (isNaN(parsedDate.getTime())) {
      errors.push({
        field: "Tgl_Lahir",
        message: "Format tanggal tidak valid",
      });
    }
  }

  let parsedGaji: number | undefined;
  if (Gaji !== undefined) {
    parsedGaji = Number(Gaji);
    if (isNaN(parsedGaji) || parsedGaji <= 0) {
      errors.push({
        field: "Gaji",
        message: "Gaji harus berupa angka valid",
      });
    }
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

  const existing = await prisma.KARYAWAN.findUnique({
    where: { Id: parsedId },
  });

  if (!existing) {
    return NextResponse.json(
      {
        metadata: { error: 1, message: "Data tidak ditemukan" },
      },
      { status: 404 }
    );
  }

  const update = await prisma.KARYAWAN.update({
    where: { Id: parsedId },
    data: {
      ...(Nama !== undefined && { Nama }),
      ...(parsedDate && { Tgl_Lahir: parsedDate }),
      ...(parsedGaji !== undefined && { Gaji: parsedGaji }),
    },
  });

  return NextResponse.json({
    metadata: {
      error: 0,
      message: "Data karyawan berhasil diupdate",
    },
    data: update,
  });
};




export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ← format benar di Next.js 15+
) {
  // 1. Await params dulu (wajib!)
  const { id } = await context.params;

  // 2. Verifikasi JWT (tetap sama)
  const decoded: any = await verifyAdminJWT();
  if (decoded instanceof NextResponse) return decoded;

  try {
    // Validasi ID (meskipun dari params seharusnya selalu ada, tapi aman)
    if (!id) {
      return NextResponse.json(
        {
          metadata: { error: 1, message: "ID wajib diisi." },
        },
        { status: 400 }
      );
    }

    // Cek apakah teknisi ada
    const existingKaryawan = await prisma.KARYAWAN.findUnique({
      where: { Id : Number(id)},
    });

    if (!existingKaryawan) {
      return getResponseNotFound();
    }

    // Hapus data
    await prisma.KARYAWAN.delete({
      where: { Id :Number(id)},
    });

    // Response sukses
    return NextResponse.json(
      {
        metadata: {
          error: 0,
          message: "Data berhasil dihapus.",
        },
        deleted: {
          id: existingKaryawan.id,
          IdTeknisi: existingKaryawan.teknisiId, // sesuaikan field yang benar
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("ERROR DELETE KARYAWAN:", error);

    return NextResponse.json(
      {
        metadata: {
          error: 1,
          message: "Terjadi kesalahan pada server.",
        },
        detail: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
