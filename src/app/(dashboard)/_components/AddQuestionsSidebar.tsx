import { useMediaQuery } from "@material-ui/core";
import { useEffect, useMemo, useState } from "react";
import { BsLayoutSidebarInset } from "react-icons/bs";
import { IQuestion } from "../shared/interfaces";
import { SidebarQuestion } from "./SidebarQuestion";

interface Props {
  questions: IQuestion[];
  id?: number;
  testName ?: string;
}

export const AddQuestionsSidebar: React.FC<Props> = ({ questions, id }) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const [expandQuestion, setExpandQuestion] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");
  const [expanded, setExpanded] = useState(true);
  const [search, setSearch] = useState("");

  const filteredQuestions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return questions;

    return questions.filter((question, index) =>
      `${index + 1} ${question.title} ${question.quiz}`.toLowerCase().includes(keyword)
    );
  }, [questions, search]);

  useEffect(() => {
    if (expanded) {
      const timeout = setTimeout(() => {
        setShowQuestions(true);
      }, 300);
      return () => {
        clearTimeout(timeout);
        setShowQuestions(false);
        setExpandQuestion("");
      };
    }
  }, [expanded]);

  useEffect(() => {
    if (isMobile) {
      setExpanded(false);
    } else {
      setExpanded(true);
    }
  }, [isMobile]);

  return (
    <div
      className="flex h-full flex-col overflow-hidden transition-all duration-300"
      style={{ width: expanded ? (isMobile ? "100%" : "100%") : "56px" }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-3">
        {expanded && showQuestions && (
          <div>
            <p className="text-sm font-semibold text-slate-950">Navigasi Soal</p>
            <p className="text-xs text-slate-500">{questions.length} soal tersimpan</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          title={expanded ? "Sembunyikan daftar soal" : "Tampilkan daftar soal"}
        >
          <BsLayoutSidebarInset size={18} />
        </button>
      </div>

      {expanded && showQuestions && (
        <div className="border-b border-slate-200 bg-white p-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            placeholder="Cari nomor atau isi soal"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question, index) => (
            <SidebarQuestion
              id={id}
              setExpandQuestion={setExpandQuestion}
              setExpanded={setExpanded}
              expandQuestion={expandQuestion}
              question={question}
              key={question._id}
              index={questions.findIndex((item) => item._id === question._id)}
              expanded={expanded}
              showQuestions={showQuestions}
              testname={question.quiz}
            />
          ))
        ) : (
          <p className="rounded-lg bg-white p-4 text-center text-sm text-slate-500">
            {questions.length ? "Tidak ada soal yang cocok." : "Belum ada soal yang ditambahkan."}
          </p>
        )}
      </div>
    </div>
  );
};
