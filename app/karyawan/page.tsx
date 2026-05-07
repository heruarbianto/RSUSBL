"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence } from "framer-motion";
import { CalendarDays } from "lucide-react";
import {
  faEdit,
  faTrash,
  faEye,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

type karyawan = {
  Id: string;
  Nama: string;
  Tgl_Lahir: string;
  Gaji: number;
};

export default function KaryawanPage() {
  const [detailTarget, setDetailTarget] = useState<karyawan | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [data, setData] = useState<karyawan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<karyawan | null>(null);
  const [progress, setProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<karyawan | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formOpen, setformOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    Nama: "",
    Tgl_Lahir: "",
    Gaji: "",
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    Id: "",
    Nama: "",
    Tgl_Lahir: "",
    Gaji: "",
  });
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [errorEdit, setErrorEdit] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setEditForm({
    ...editForm,
    [e.target.name]: e.target.value,
  });
};
const handleUpdate = async () => {
  setLoadingEdit(true);
  setErrorEdit(null);

  try {
    const res = await fetch(`/api/karyawan/${editForm.Id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        Nama: editForm.Nama,
        Tgl_Lahir: editForm.Tgl_Lahir,
        Gaji: Number(editForm.Gaji),
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result?.metadata?.message || "Gagal update");
    }

    // update state table (biar realtime)
    setData((prev) =>
      prev.map((item) =>
        item.Id === editForm.Id
          ? {
              ...item,
              Nama: editForm.Nama,
              Tgl_Lahir: editForm.Tgl_Lahir,
              Gaji: Number(editForm.Gaji),
            }
          : item
      )
    );
    location.reload();
    setEditOpen(false);
  } catch (err: any) {
    setErrorEdit(err.message);
  } finally {
    setLoadingEdit(false);
  }
};

  const handleDetail = async (id: string) => {
    try {
      setLoadingDetail(true);
      setDetailTarget(data.find((d) => d.Id === id) || null);

      const res = await fetch(`/api/karyawan/${id}`, {
        credentials: "include",
      });

      const json = await res.json();
      setDetailData(json.datakaryawan);
      // console.log(json)
    } catch (err) {
      console.error("Gagal ambil detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    if (!form.Nama || !form.Tgl_Lahir || !form.Gaji) {
      setError("Semua field wajib diisi");
      return;
    }

    try {
      const res = await fetch("/api/karyawan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 🔐 penting kalau pakai JWT cookie
        body: JSON.stringify({
          Nama: form.Nama,
          Tgl_Lahir: form.Tgl_Lahir,
          Gaji: Number(form.Gaji),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.metadata?.message || "Gagal menyimpan");
      }

      // reset + close modal
      setForm({
        Nama: "",
        Tgl_Lahir: "",
        Gaji: "",
      });

      setformOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    location.reload();
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);

      await fetch(`/api/karyawan/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      setData((prev) => prev.filter((item) => item.Id !== id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Gagal menghapus:", error);
    } finally {
      setDeleting(false);
    }
  };
  // FETCH DATA

  useEffect(() => {
    fetch("/api/karyawan", { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        setData(json.datakaryawan || []);
        setLoading(false);
      });
  }, []);

  // REALTIME FILTER
  const filtered = useMemo(() => {
    return data.filter((t) =>
      [t.Nama, t.Tgl_Lahir]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search, data]);

  return (
    <div className="space-y-6 mt-15 p-3">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Data Karyawan</h1>
          <p className="text-sm text-gray-500"></p>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        {/* <h1 className="text-2xl font-semibold"></h1> */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setformOpen(true)}
          className="
    px-5 py-2.5
    rounded-xl
    bg-indigo-600
    text-white
    shadow-md
    hover:bg-indigo-700
    transition-all
  "
        >
          + Tambah karyawan
        </motion.button>
        {/* SEARCH */}
        <div className="relative w-full md:w-80">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-3 text-neutral-400"
          />
          <input
            placeholder="Cari Karyawan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full pl-11 pr-4 py-2.5
              rounded-xl
              bg-white dark:bg-neutral-900
              shadow-sm
              focus:outline-none
              focus:ring-2 focus:ring-indigo-500/40
              transition
            "
          />
        </div>
      </motion.div>

      {/* TABLE CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          bg-white dark:bg-neutral-900
          rounded-2xl
          shadow-sm
          overflow-hidden
        "
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* HEADER */}
            <thead className="bg-neutral-50 dark:bg-neutral-800/40">
              <tr className="text-left text-neutral-600 dark:text-neutral-300">
                <th className="p-4">Nama</th>
                <th className="p-4">Tanggal Lahir</th>
                <th className="p-4">Gaji</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    Tidak ada data
                  </td>
                </tr>
              )}

              {filtered.map((t, i) => (
                <motion.tr
                  key={t.Id ?? i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="
                    border-t border-neutral-100 dark:border-neutral-800/40
                    hover:bg-indigo-50/50 dark:hover:bg-neutral-800/40
                    transition-colors
                  "
                >
                  <td className="p-4 font-medium">{t.Nama} </td>
                  <td className="p-4">{t.Tgl_Lahir}</td>
                  <td className="p-4">{t.Gaji}</td>

                  {/* ACTION BUTTONS */}
                  <td className="p-4">
                    <div className="flex justify-end gap-3">
                      <ActionBtn
                        icon={faEye}
                      />
                      <ActionBtn
                        icon={faEdit}
                        onClick={() => {
                          setEditForm({
                            Id: t.Id,
                            Nama: t.Nama,
                            Tgl_Lahir: t.Tgl_Lahir?.split("T")[0], // biar cocok input date
                            Gaji: String(t.Gaji),
                          });
                          setEditOpen(true);
                        }}
                      />

                      <ActionBtn
                        icon={faTrash}
                        danger
                        onClick={() => setDeleteTarget(t)}
                      />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="
                      bg-white dark:bg-neutral-900
                      w-[90%] max-w-md
                      rounded-3xl
                      p-6
                      shadow-2xl
                    "
            >
              <h2 className="text-lg font-semibold mb-3 text-red-600">
                Hapus Karyawan
              </h2>

              <p className="text-sm text-neutral-500 mb-6">
                Yakin ingin menghapus Karyawan dengan ID{" "}
                <span className="font-medium">{deleteTarget.Nama}</span> ?
                Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="
                          px-4 py-2 rounded-xl
                          bg-neutral-100 dark:bg-neutral-800
                          hover:bg-neutral-200
                          transition
                        "
                >
                  Batal
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(deleteTarget.Id)}
                  disabled={deleting}
                  className="
                          px-4 py-2 rounded-xl
                          bg-red-500 text-white
                          hover:bg-red-600
                          transition
                          shadow-md hover:shadow-lg
                          disabled:opacity-60
                        "
                >
                  {deleting ? "Menghapus..." : "Hapus"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="
          bg-white dark:bg-neutral-900
          w-full max-w-3xl
          rounded-3xl
          p-6
          shadow-2xl
          max-h-[85vh]
          overflow-y-auto
        "
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold">Detail karyawan</h2>
                <button
                  onClick={() => {
                    setDetailTarget(null);
                    setDetailData(null);
                  }}
                  className="text-neutral-400 hover:text-red-500 transition"
                >
                  ✕
                </button>
              </div>

              {loadingDetail ? (
                <p className="text-center py-10">Loading detail...</p>
              ) : (
                <>
                  {/* FILE INFO SATU BARIS */}
                  <div
                    className="
      flex flex-wrap items-center gap-6
      text-sm
      mb-6
      pb-4
      border-b border-neutral-200 dark:border-neutral-800
    "
                  >
                    <span>
                      <span className="text-neutral-400">Nama:</span>{" "}
                      <span className="font-medium">
                        {detailData?.nama_file}
                      </span>
                    </span>

                    <span>
                      <span className="text-neutral-400">Tanggal:</span>{" "}
                      {new Date(detailData?.tanggal_masuk).toLocaleString()}
                    </span>

                    <span>
                      <span className="text-neutral-400">Total Chunk:</span>{" "}
                      <span className="font-semibold">
                        {detailData?.chunks?.length}
                      </span>
                    </span>

                    <a
                      href={detailData?.link_url}
                      target="_blank"
                      className="
          ml-auto
          text-indigo-600
          hover:text-indigo-800
          transition
        "
                    >
                      Download File
                    </a>
                  </div>

                  {/* TABLE DAFTAR ISI CHUNKS */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 dark:bg-neutral-800/40">
                        <tr className="text-left text-neutral-600 dark:text-neutral-300">
                          <th className="p-3">No</th>
                          <th className="p-3">Lines</th>
                          <th className="p-3">Preview Content</th>
                        </tr>
                      </thead>

                      <tbody>
                        {detailData?.chunks?.map((chunk: any, i: number) => (
                          <motion.tr
                            key={chunk.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="
                border-t border-neutral-100 dark:border-neutral-800/40
                hover:bg-indigo-50/40 dark:hover:bg-neutral-800/40
                transition-colors
              "
                          >
                            <td className="p-3">{i + 1}</td>

                            <td className="p-3 text-neutral-500">
                              {chunk.metadata?.loc?.lines?.from} -
                              {chunk.metadata?.loc?.lines?.to}
                            </td>

                            <td className="p-3">
                              <div
                                className="
                  max-h-24
                  overflow-y-auto
                  whitespace-pre-line
                "
                              >
                                {chunk.content}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
        fixed inset-0 z-50
        bg-black/40 backdrop-blur-md
        flex items-center justify-center
        p-4
      "
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 20,
              }}
              className="
          w-full max-w-xl
          overflow-hidden
          rounded-[30px]
          bg-white dark:bg-neutral-900
          shadow-[0_20px_80px_rgba(0,0,0,0.35)]
          border border-white/10
        "
            >
              {/* HEADER */}
              <div
                className="
            relative overflow-hidden
            px-7 py-6
            bg-gradient-to-r
            from-indigo-600
            via-violet-600
            to-purple-600
          "
              >
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent_40%)]" />

                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white">
                    Tambah Karyawan
                  </h2>

                  <p className="text-sm text-indigo-100 mt-1">
                    Input data karyawan baru ke sistem.
                  </p>
                </div>
              </div>

              {/* BODY */}
              <div className="p-7 space-y-5">
                {/* ID */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    ID
                  </label>

                  <input
                    type="text"
                    disabled
                    placeholder="Auto Increment"
                    className="
                w-full rounded-2xl
                border border-neutral-200 dark:border-neutral-700
                bg-neutral-100 dark:bg-neutral-800
                px-4 py-3
                text-neutral-500
                cursor-not-allowed
              "
                  />
                </div>

                {/* NAMA */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Nama
                  </label>

                  <input
                    type="text"
                    name="Nama"
                    value={form.Nama}
                    onChange={handleChange}
                    placeholder="Masukkan nama karyawan"
                    className="
                w-full rounded-2xl
                border border-neutral-200 dark:border-neutral-700
                bg-neutral-50 dark:bg-neutral-800
                px-4 py-3
                outline-none
                transition-all duration-300
                focus:ring-4 focus:ring-indigo-500/20
                focus:border-indigo-500
              "
                  />
                </div>

                {/* TANGGAL LAHIR */}
                {/* TANGGAL LAHIR */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Tanggal Lahir
                  </label>

                  <div className="relative group">
                    {/* ICON */}
                    <div
                      className="
        absolute left-4 top-1/2 -translate-y-1/2
        text-neutral-400
        pointer-events-none
        transition
        group-focus-within:text-indigo-500
      "
                    >
                      <CalendarDays size={20} />
                    </div>

                    <input
                      type="date"
                      name="Tgl_Lahir"
                      value={form.Tgl_Lahir}
                      onChange={handleChange}
                      className="
        w-full
        rounded-2xl
        border border-neutral-200 dark:border-neutral-700
        bg-neutral-50 dark:bg-neutral-800
        pl-12 pr-4 py-3

        text-neutral-700 dark:text-neutral-200

        outline-none
        transition-all duration-300

        focus:ring-4 focus:ring-indigo-500/20
        focus:border-indigo-500

        hover:border-indigo-400

        [&::-webkit-calendar-picker-indicator]:opacity-0
        [&::-webkit-calendar-picker-indicator]:absolute
        [&::-webkit-calendar-picker-indicator]:right-0
        [&::-webkit-calendar-picker-indicator]:w-full
        [&::-webkit-calendar-picker-indicator]:h-full
        [&::-webkit-calendar-picker-indicator]:cursor-pointer
      "
                    />

                    {/* GLOW EFFECT */}
                    <div
                      className="
        absolute inset-0 rounded-2xl
        opacity-0 group-focus-within:opacity-100
        bg-indigo-500/5
        pointer-events-none
        transition duration-300
      "
                    />
                  </div>
                </div>

                {/* GAJI */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Gaji
                  </label>

                  <div className="relative">
                    <span
                      className="
                  absolute left-4 top-1/2 -translate-y-1/2
                  text-neutral-500
                "
                    >
                      Rp
                    </span>

                    <input
                      type="number"
                      name="Gaji"
                      value={form.Gaji}
                      onChange={handleChange}
                      placeholder="0"
                      className="
                  w-full rounded-2xl
                  border border-neutral-200 dark:border-neutral-700
                  bg-neutral-50 dark:bg-neutral-800
                  pl-12 pr-4 py-3
                  outline-none
                  transition-all duration-300
                  focus:ring-4 focus:ring-indigo-500/20
                  focus:border-indigo-500
                "
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div
                className="
            flex justify-end gap-3
            px-7 py-5
            border-t border-neutral-200 dark:border-neutral-800
            bg-neutral-50/70 dark:bg-neutral-900/50
            backdrop-blur-sm
          "
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setformOpen(false)}
                  className="
              px-5 py-3
              rounded-2xl
              font-medium
              bg-neutral-200 dark:bg-neutral-800
              hover:bg-neutral-300 dark:hover:bg-neutral-700
              transition-all
            "
                >
                  Batal
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  className="
              px-6 py-3
              rounded-2xl
              font-semibold
              text-white
              bg-gradient-to-r
              from-indigo-600
              via-violet-600
              to-purple-600
              shadow-lg shadow-indigo-500/30
              hover:shadow-indigo-500/50
              transition-all duration-300
            "
                >
                  Simpan
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
<AnimatePresence>
        {editOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
        fixed inset-0 z-50
        bg-black/40 backdrop-blur-md
        flex items-center justify-center
        p-4
      "
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 20,
              }}
              className="
          w-full max-w-xl
          overflow-hidden
          rounded-[30px]
          bg-white dark:bg-neutral-900
          shadow-[0_20px_80px_rgba(0,0,0,0.35)]
          border border-white/10
        "
            >
              {/* HEADER */}
              <div
                className="
            relative overflow-hidden
            px-7 py-6
            bg-gradient-to-r
            from-indigo-600
            via-violet-600
            to-purple-600
          "
              >
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent_40%)]" />

                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white">
                    Update Karyawan
                  </h2>

                  <p className="text-sm text-indigo-100 mt-1">
                    Update data karyawan ke sistem.
                  </p>
                </div>
              </div>

              {/* BODY */}
              <div className="p-7 space-y-5">
                {/* NAMA */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Nama
                  </label>

                  <input
                    type="text"
                    name="Nama"
                    value={editForm.Nama}
                    onChange={handleEditChange}
                    placeholder="Masukkan nama karyawan"
                    className="
                w-full rounded-2xl
                border border-neutral-200 dark:border-neutral-700
                bg-neutral-50 dark:bg-neutral-800
                px-4 py-3
                outline-none
                transition-all duration-300
                focus:ring-4 focus:ring-indigo-500/20
                focus:border-indigo-500
              "
                  />
                </div>

                {/* TANGGAL LAHIR */}
                {/* TANGGAL LAHIR */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Tanggal Lahir
                  </label>

                  <div className="relative group">
                    {/* ICON */}
                    <div
                      className="
        absolute left-4 top-1/2 -translate-y-1/2
        text-neutral-400
        pointer-events-none
        transition
        group-focus-within:text-indigo-500
      "
                    >
                      <CalendarDays size={20} />
                    </div>

                    <input
                      type="date"
                      name="Tgl_Lahir"
                      value={editForm.Tgl_Lahir}
                      onChange={handleEditChange}
                      className="
        w-full
        rounded-2xl
        border border-neutral-200 dark:border-neutral-700
        bg-neutral-50 dark:bg-neutral-800
        pl-12 pr-4 py-3

        text-neutral-700 dark:text-neutral-200

        outline-none
        transition-all duration-300

        focus:ring-4 focus:ring-indigo-500/20
        focus:border-indigo-500

        hover:border-indigo-400

        [&::-webkit-calendar-picker-indicator]:opacity-0
        [&::-webkit-calendar-picker-indicator]:absolute
        [&::-webkit-calendar-picker-indicator]:right-0
        [&::-webkit-calendar-picker-indicator]:w-full
        [&::-webkit-calendar-picker-indicator]:h-full
        [&::-webkit-calendar-picker-indicator]:cursor-pointer
      "
                    />

                    {/* GLOW EFFECT */}
                    <div
                      className="
        absolute inset-0 rounded-2xl
        opacity-0 group-focus-within:opacity-100
        bg-indigo-500/5
        pointer-events-none
        transition duration-300
      "
                    />
                  </div>
                </div>

                {/* GAJI */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Gaji
                  </label>

                  <div className="relative">
                    <span
                      className="
                  absolute left-4 top-1/2 -translate-y-1/2
                  text-neutral-500
                "
                    >
                      Rp
                    </span>

                    <input
                      type="number"
                      name="Gaji"
                      value={editForm.Gaji}
                      onChange={handleEditChange}
                      placeholder="0"
                      className="
                  w-full rounded-2xl
                  border border-neutral-200 dark:border-neutral-700
                  bg-neutral-50 dark:bg-neutral-800
                  pl-12 pr-4 py-3
                  outline-none
                  transition-all duration-300
                  focus:ring-4 focus:ring-indigo-500/20
                  focus:border-indigo-500
                "
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div
                className="
            flex justify-end gap-3
            px-7 py-5
            border-t border-neutral-200 dark:border-neutral-800
            bg-neutral-50/70 dark:bg-neutral-900/50
            backdrop-blur-sm
          "
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setEditOpen(false)}
                  className="
              px-5 py-3
              rounded-2xl
              font-medium
              bg-neutral-200 dark:bg-neutral-800
              hover:bg-neutral-300 dark:hover:bg-neutral-700
              transition-all
            "
                >
                  Batal
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpdate}
                  className="
              px-6 py-3
              rounded-2xl
              font-semibold
              text-white
              bg-gradient-to-r
              from-indigo-600
              via-violet-600
              to-purple-600
              shadow-lg shadow-indigo-500/30
              hover:shadow-indigo-500/50
              transition-all duration-300
            "
                >
                  Simpan
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ACTION BUTTON COMPONENT */

function ActionBtn({ icon, danger, onClick }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.12, y: -2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`
        w-9 h-9 rounded-xl flex items-center justify-center
        cursor-pointer
        transition-all duration-300 ease-out
        ${
          danger
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "bg-neutral-100 dark:bg-neutral-800 hover:bg-indigo-100 hover:text-indigo-600"
        }
      `}
    >
      <FontAwesomeIcon icon={icon} size="sm" />
    </motion.button>
  );
}
