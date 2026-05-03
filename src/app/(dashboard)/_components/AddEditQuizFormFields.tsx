import { useFormikContext } from "formik";
import { useState } from "react";
import { IQuiz } from "../shared/interfaces";

function getError(errors: any, touched: any, field: string) {
  return touched[field] && errors[field] ? String(errors[field]) : "";
}

export const AddEditQuizFormFields = ({ id }: { id?: string }) => {
  const { touched, errors, values, handleBlur, handleChange, setFieldValue } =
    useFormikContext<IQuiz>();
  const [tagDraft, setTagDraft] = useState("");

  const tags = values.tags || [];
  const passingGrades = values.passingGrades || {};

  const addTag = () => {
    const nextTag = tagDraft.trim();
    if (!nextTag || tags.includes(nextTag)) return;
    setFieldValue("tags", [...tags, nextTag]);
    setTagDraft("");
  };

  const removeTag = (tag: string) => {
    setFieldValue(
      "tags",
      tags.filter((item) => item !== tag)
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="title" className="text-sm font-semibold text-slate-800">
          Nama Paket
        </label>
        <input
          id="title"
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
          placeholder="Contoh: Paket SKD TO 1 - Nasionalisme"
        />
        {getError(errors, touched, "title") && (
          <p className="mt-1 text-sm text-rose-600">
            {getError(errors, touched, "title")}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="text-sm font-semibold text-slate-800"
        >
          Deskripsi Paket
        </label>
        <textarea
          id="description"
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={5}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
          placeholder="Jelaskan fokus materi, target peserta, atau instruksi singkat paket."
        />
        {getError(errors, touched, "description") && (
          <p className="mt-1 text-sm text-rose-600">
            {getError(errors, touched, "description")}
          </p>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label
            htmlFor="tryoutOrder"
            className="text-sm font-semibold text-slate-800"
          >
            Urutan Try Out
          </label>
          <input
            id="tryoutOrder"
            type="number"
            min={1}
            value={values.tryoutOrder || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
            placeholder="1"
          />
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Contoh: 1 untuk TO 1, 2 untuk TO 2. Jika kosong, sistem memakai urutan berikutnya.
          </p>
          {getError(errors, touched, "tryoutOrder") && (
            <p className="mt-1 text-sm text-rose-600">
              {getError(errors, touched, "tryoutOrder")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="duration"
            className="text-sm font-semibold text-slate-800"
          >
            Durasi Ujian
          </label>
          <div className="mt-2 flex h-12 rounded-lg border border-slate-300 bg-white transition focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-50">
            <input
              id="duration"
              type="number"
              min={1}
              max={600}
              value={values.duration || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full rounded-lg border-0 bg-transparent px-4 text-sm font-medium text-slate-950 outline-none"
              placeholder="120"
            />
            <span className="flex items-center border-l border-slate-200 px-3 text-sm font-medium text-slate-500">
              menit
            </span>
          </div>
          {getError(errors, touched, "duration") && (
            <p className="mt-1 text-sm text-rose-600">
              {getError(errors, touched, "duration")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="maxAttempts"
            className="text-sm font-semibold text-slate-800"
          >
            Batas Percobaan
          </label>
          <div className="mt-2 flex h-12 rounded-lg border border-slate-300 bg-white transition focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-50">
            <input
              id="maxAttempts"
              type="number"
              min={1}
              max={20}
              value={values.maxAttempts || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full rounded-lg border-0 bg-transparent px-4 text-sm font-medium text-slate-950 outline-none"
              placeholder="1"
            />
            <span className="flex items-center border-l border-slate-200 px-3 text-sm font-medium text-slate-500">
              kali
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Jumlah maksimal siswa boleh mengerjakan paket ini.
          </p>
          {getError(errors, touched, "maxAttempts") && (
            <p className="mt-1 text-sm text-rose-600">
              {getError(errors, touched, "maxAttempts")}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Nilai Batas Kelulusan
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Isi 0 jika kategori tidak dipakai pada paket ini.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {["TWK", "TIU", "TKP"].map((type) => (
            <div key={type}>
              <label
                htmlFor={`passingGrades.${type}`}
                className="text-sm font-semibold text-slate-800"
              >
                {type}
              </label>
              <input
                id={`passingGrades.${type}`}
                name={`passingGrades.${type}`}
                type="number"
                min={0}
                max={999}
                value={passingGrades[type] ?? 0}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="examToken"
          className="text-sm font-semibold text-slate-800"
        >
          Token Ujian
        </label>
        <input
          id="examToken"
          value={values.examToken || ""}
          onChange={(event) =>
            setFieldValue("examToken", event.target.value.toUpperCase())
          }
          onBlur={handleBlur}
          className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 font-mono text-sm font-semibold uppercase text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
          placeholder="SKD-TO1-2026"
        />
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Token ini wajib dimasukkan siswa sebelum ujian dimulai.
        </p>
        {getError(errors, touched, "examToken") && (
          <p className="mt-1 text-sm text-rose-600">
            {getError(errors, touched, "examToken")}
          </p>
        )}
      </div>

      {id && (
        <div>
          <label
            htmlFor="status"
            className="text-sm font-semibold text-slate-800"
          >
            Status
          </label>
          <select
            id="status"
            value={values.status}
            onChange={(event) => setFieldValue("status", event.target.value)}
            className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      )}

      <div>
        <label className="text-sm font-semibold text-slate-800">Tags</label>
        <div className="mt-2 flex gap-2">
          <input
            value={tagDraft}
            onChange={(event) => setTagDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addTag();
              }
            }}
            className="h-12 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
            placeholder="Ketik tag lalu Enter"
          />
          <button
            type="button"
            onClick={addTag}
            className="rounded-lg border border-teal-200 bg-teal-50 px-4 text-sm font-semibold text-teal-700 hover:bg-teal-100"
          >
            Tambah
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700"
              title="Klik untuk menghapus tag"
            >
              {tag}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Minimal satu tag. Klik tag untuk menghapusnya.
        </p>
        {getError(errors, touched, "tags") && (
          <p className="mt-1 text-sm text-rose-600">
            {getError(errors, touched, "tags")}
          </p>
        )}
      </div>
    </div>
  );
};
