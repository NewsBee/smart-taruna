"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import type { IResponse } from "@/app/(dashboard)/shared/interfaces";
import { acknowledgeDraft, ExamDraft, examDraftKey, parseExamDraft } from "@/app/lib/exam-draft";

type ExamData = {
  attemptId: number; userId: number; testName: string;
  questions: { id: number; content: string; image?: string; answerType?: string;
    savedResponse: string; choices: { content: string }[] }[];
};

export function useExamAnswers(data: ExamData | undefined, onCompleted: (id: number) => void) {
  const [response, setResponse] = useState<IResponse[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [saveError, setSaveError] = useState("");
  const [storageError, setStorageError] = useState("");
  const pending = useRef<ExamDraft>({});
  const key = useRef("");
  const attemptId = useRef(0);
  const sending = useRef(false);
  const mounted = useRef(true);
  const finished = useRef(false);
  const completed = useRef(onCompleted);
  completed.current = onCompleted;

  const persist = useCallback(() => {
    setPendingCount(Object.keys(pending.current).length);
    if (!key.current) return;
    try {
      if (Object.keys(pending.current).length) localStorage.setItem(key.current, JSON.stringify(pending.current));
      else localStorage.removeItem(key.current);
      setStorageError("");
    } catch {
      setStorageError("Draft tidak dapat disimpan di browser. Jangan tutup halaman sebelum jawaban terkirim.");
    }
  }, []);

  const clearDraft = useCallback(() => {
    finished.current = true;
    pending.current = {};
    persist();
  }, [persist]);

  const flush = useCallback(async () => {
    if (!mounted.current || sending.current || finished.current || !attemptId.current || !navigator.onLine) return;
    sending.current = true;
    const currentAttempt = attemptId.current;
    try {
      // One request at a time prevents an older answer overtaking a newer edit.
      while (mounted.current && !finished.current && currentAttempt === attemptId.current) {
        const next = Object.entries(pending.current)[0];
        if (!next) break;
        const [id, draft] = next;
        try {
          await axios.post("/api/ujian/response", {
            attemptId: currentAttempt, questionId: Number(id), response: draft.value,
          }, { timeout: 10000 });
          if (!mounted.current || currentAttempt !== attemptId.current || finished.current) break;
          acknowledgeDraft(pending.current, id, draft.revision);
          persist();
          setSaveError("");
        } catch (error: any) {
          if (!mounted.current || currentAttempt !== attemptId.current) break;
          if (error.response?.data?.completed) {
            clearDraft();
            completed.current(currentAttempt);
          } else {
            setSaveError(error.response?.data?.message || "Jawaban belum terkirim ke server. Pengiriman akan dicoba kembali.");
          }
          break;
        }
      }
    } finally { sending.current = false; }
  }, [clearDraft, persist]);

  useEffect(() => {
    if (!data?.attemptId || !data.userId) return;
    const nextKey = examDraftKey(data.userId, data.attemptId);
    const sameAttempt = key.current === nextKey;
    if (!sameAttempt) {
      key.current = nextKey;
      attemptId.current = data.attemptId;
      finished.current = false;
      try { pending.current = parseExamDraft(localStorage.getItem(nextKey)); }
      catch { pending.current = {}; setStorageError("Draft browser tidak dapat dibaca."); }
    }
    const assignedIds = new Set(data.questions.map((question) => String(question.id)));
    for (const id of Object.keys(pending.current)) if (!assignedIds.has(id)) delete pending.current[id];
    setResponse((previous) => {
      const previousAnswers = new Map(sameAttempt ? previous.map((item) => [item._id, item.response]) : []);
      return data.questions.map((question) => ({
        _id: String(question.id), title: question.content, quiz: data.testName,
        image: question.image, answerType: question.answerType,
        response: pending.current[question.id]?.value ?? previousAnswers.get(String(question.id)) ?? question.savedResponse ?? "",
        options: question.choices.map((choice) => ({ value: choice.content })),
      }));
    });
    persist();
    void flush();
  }, [data, flush, persist]);

  useEffect(() => {
    mounted.current = true;
    const timer = setInterval(() => { void flush(); }, 5000);
    const online = () => { void flush(); };
    window.addEventListener("online", online);
    return () => { mounted.current = false; clearInterval(timer); window.removeEventListener("online", online); };
  }, [flush]);

  const saveResponse = useCallback((questionId: string, value: string) => {
    if (!attemptId.current || finished.current) return;
    pending.current[questionId] = { value, revision: crypto.randomUUID() };
    persist();
    void flush();
  }, [flush, persist]);

  return { response, setResponse, saveResponse, clearDraft, pendingCount, saveError, storageError };
}
