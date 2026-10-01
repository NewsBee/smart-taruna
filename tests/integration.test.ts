import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { PrismaClient } from "@prisma/client";
import { encode } from "next-auth/jwt";
import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const db = new PrismaClient();
const origin = process.env.TEST_ORIGIN!;
if (!origin || !new URL(process.env.DATABASE_URL!).pathname.startsWith("/smart_taruna_test_")) throw new Error("Tests require the isolated runner.");
let adminCookie: string, studentCookie: string, otherCookie: string;
let studentId: number, packageId: number, testId: number;
let questionIds: number[];
const question = { content: "Question", type: "TIU", answerType: "MULTIPLE_CHOICE",
  Choices: [{ content: "Correct", isCorrect: true, scoreValue: 5 }, { content: "Wrong", isCorrect: false, scoreValue: 0 }] };

async function cookie(id: number, role: string) {
  return "next-auth.session-token=" + await encode({ secret: process.env.NEXTAUTH_SECRET!, token: { id: String(id), role, username: role, email: role + "@test.local" }, maxAge: 3600 });
}
async function api(url: string, method = "GET", body?: unknown, auth = studentCookie) {
  return fetch(origin + url, { method, headers: { Cookie: auth || "", ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }) },
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body) });
}
async function attempt(expired = false) {
  return db.attempt.create({ data: { userId: studentId, testId, packageId, questionOrder: [questionIds[0]],
    choiceOrder: {}, createdAt: new Date(Date.now() - (expired ? 180000 : 0)), examTokenVerifiedAt: new Date() } });
}

before(async () => {
  const admin = await db.user.create({ data: { username: "admin", email: "admin@test.local", password: "unused", role: "admin" } });
  const student = await db.user.create({ data: { username: "student", email: "student@test.local", password: "unused" } });
  const other = await db.user.create({ data: { username: "other", email: "other@test.local", password: "unused" } });
  studentId = student.id;
  adminCookie = await cookie(admin.id, "admin"); studentCookie = await cookie(student.id, "siswa"); otherCookie = await cookie(other.id, "siswa");
  const exam = await db.test.create({ data: { name: "SKD" } }); testId = exam.id;
  const pack = await db.package.create({ data: { testName: "SKD", title: "Test package", description: "isolated", duration: 1, examToken: "SECRET123" } }); packageId = pack.id;
  const questions = await Promise.all([0, 1].map(() => db.question.create({ data: { ...question, packageId, Choices: { create: question.Choices } } })));
  questionIds = questions.map((q) => q.id);
});
after(async () => { await db.$disconnect(); });

test("bank soal blocks anonymous and student access for every write route", async () => {
  for (const auth of ["", studentCookie]) {
    const status = auth ? 403 : 401;
    for (const [url, method, body] of [
      ["/api/test/" + questionIds[0] + "/quiz", "GET", undefined],
      ["/api/test/" + questionIds[0] + "/quiz", "PUT", question],
      ["/api/test/" + packageId + "/questions", "POST", question],
      ["/api/test/" + packageId + "/questions", "DELETE", { id: questionIds[0] }],
      ["/api/pertanyaan/create", "POST", { ...question, packageId }],
      ["/api/pertanyaan/create/uploadimg/" + packageId, "POST", undefined],
    ] as const) assert.equal((await api(url, method, body, auth)).status, status, method + " " + url);
  }
  assert.equal(await db.question.count(), 2);
});

test("student package list and active result never disclose token, keys or explanation", async () => {
  const res = await api("/api/paket/SKD"); assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.packages[0].examToken, undefined);
  assert.equal(data.packages[0].questions[0].correctAnswer, undefined);
  const session = await attempt();
  assert.equal((await api("/api/hasil/" + session.id)).status, 403);
  const questions = await (await api("/api/test/" + packageId + "/questions")).json();
  assert.equal(questions.questions[0].explanationImage, undefined);
  assert.equal(questions.questions[0].choices[0].isCorrect, undefined);
  await db.attempt.update({ where: { id: session.id }, data: { completedAt: new Date() } });
});

test("admin converts input to choice and back, and adds/removes options", async () => {
  const created = await api("/api/test/" + packageId + "/questions", "POST", { ...question, answerType: "SHORT_TEXT", correctAnswer: "answer" }, adminCookie);
  assert.equal(created.status, 201); const { newQuestion } = await created.json();
  const url = "/api/test/" + newQuestion.id + "/quiz";
  assert.equal((await api(url, "PUT", question, adminCookie)).status, 200);
  let choices = await db.choice.findMany({ where: { questionId: newQuestion.id } }); assert.equal(choices.length, 2);
  const payload = { ...question, Choices: [{ ...choices[0], content: "Updated" }, { content: "New", isCorrect: false, scoreValue: 0 }] };
  assert.equal((await api(url, "PUT", payload, adminCookie)).status, 200);
  const updated = await db.choice.findMany({ where: { questionId: newQuestion.id } });
  assert.equal(updated.length, 2); assert.ok(updated.some((c) => c.id === choices[0].id)); assert.ok(!updated.some((c) => c.id === choices[1].id));
  assert.equal((await api(url, "PUT", { ...question, answerType: "NUMERIC", correctAnswer: "12", tolerance: 0.5 }, adminCookie)).status, 200);
  assert.equal(await db.choice.count({ where: { questionId: newQuestion.id } }), 0);
});

test("autosave hides score, rejects unassigned questions and preserves saved answers on submit", async () => {
  const session = await attempt();
  const answer = { attemptId: session.id, questionId: questionIds[0], response: "Correct" };
  assert.equal((await api("/api/ujian/response", "POST", answer, otherCookie)).status, 404);
  assert.equal((await api("/api/ujian/response", "POST", { ...answer, questionId: questionIds[1] })).status, 403);
  const saved = await api("/api/ujian/response", "POST", answer); assert.equal(saved.status, 200); assert.deepEqual(await saved.json(), { saved: true });
  const rejected = await api("/api/ujian/submit", "POST", { attemptId: session.id, responses: [{ _id: questionIds[1], response: "Correct" }] });
  assert.equal(rejected.status, 403); assert.equal((await db.attempt.findUniqueOrThrow({ where: { id: session.id } })).completedAt, null);
  const done = await api("/api/ujian/submit", "POST", { attemptId: session.id, responses: [] }); assert.equal(done.status, 200); assert.equal((await done.json()).score, 5);
  const duplicate = await api("/api/ujian/submit", "POST", { attemptId: session.id, responses: [] }); assert.equal((await duplicate.json()).score, 5);
  assert.equal((await api("/api/ujian/response", "POST", { ...answer, response: "Wrong" })).status, 409);
  const result = await (await api("/api/hasil/" + session.id)).json(); assert.equal(result.attempt.User.password, undefined);
});

test("pause requests cannot increase the deadline", async () => {
  const session = await attempt();
  for (let i = 0; i < 3; i++) {
    const result = await api("/api/ujian/pause", "POST", { attemptId: session.id, pausedMs: 300000 });
    assert.equal((await result.json()).addedPausedMs, 0);
  }
  assert.equal((await db.attempt.findUniqueOrThrow({ where: { id: session.id } })).totalPausedMs, 0);
  await db.attempt.update({ where: { id: session.id }, data: { completedAt: new Date() } });
});

test("server completes expired attempts without browser traffic and without double scoring", async () => {
  const session = await attempt(true);
  await db.response.create({ data: { attemptId: session.id, questionId: questionIds[0], content: "Correct", score: 0 } });
  for (let i = 0; i < 35; i++) {
    const current = await db.attempt.findUniqueOrThrow({ where: { id: session.id } });
    if (current.completedAt) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  const current = await db.attempt.findUniqueOrThrow({ where: { id: session.id } });
  assert.ok(current.completedAt); assert.equal(current.score, 5);
  const payload = { attemptId: session.id, responses: [] };
  await Promise.all([api("/api/ujian/submit", "POST", payload), api("/api/ujian/submit", "POST", payload)]);
  assert.equal(await db.securityEvent.count({ where: { attemptId: session.id, type: "AUTO_SUBMIT_TIME_EXPIRED" } }), 1);
});

test("local profile and question uploads are readable immediately and profile deletion removes the file", async () => {
  const bytes = await sharp({ create: { width: 8, height: 8, channels: 3, background: "red" } }).png().toBuffer();
  const form = new FormData(); form.append("image", new Blob([new Uint8Array(bytes)], { type: "image/png" }), "photo.png");
  const uploaded = await api("/api/profile/uploadprofile", "POST", form); assert.equal(uploaded.status, 200);
  const data = await uploaded.json(); assert.ok(data.path.startsWith("/api/uploads/profile/")); assert.equal(data.user.password, undefined);
  const image = await api(data.path); assert.equal(image.status, 200); assert.equal(image.headers.get("content-type"), "image/webp");
  const diskPath = path.join(process.env.LOCAL_UPLOAD_DIR!, data.path.slice("/api/uploads/".length)); assert.ok((await readFile(diskPath)).length > 0);
  assert.equal((await api("/api/profile/uploadprofile", "DELETE")).status, 200);
  await assert.rejects(readFile(diskPath), { code: "ENOENT" });
  const questionUpload = await api("/api/pertanyaan/create/uploadimg/" + packageId, "POST", form, adminCookie); assert.equal(questionUpload.status, 200);
  assert.equal((await api((await questionUpload.json()).path)).status, 200);
});

test("browser retains offline drafts after reload and stays on exam when submit fails", { timeout: 180000 }, async () => {
  await db.package.update({ where: { id: packageId }, data: { duration: 10 } });
  const session = await attempt();
  const draftKey = `smarttaruna:exam:${studentId}:${session.id}`;
  const browser = await chromium.launch({ headless: true, ...(process.platform === "win32" ? { channel: "msedge" } : {}) });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addCookies([{ name: "next-auth.session-token", value: studentCookie.split("=")[1], url: origin }]);
    const page = await context.newPage();
    page.on("dialog", (dialog) => dialog.accept());
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(origin + `/ujian/SKD/${packageId}`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.getByRole("heading", { name: "Pengerjaan Try Out" }).waitFor({ timeout: 60000 });
    await page.route("**/api/ujian/response", (route) => route.abort("connectionfailed"));
    await page.getByRole("button", { name: /Correct/ }).click();
    await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key) || "{}")[Object.keys(JSON.parse(localStorage.getItem(key) || "{}"))[0]]?.value === "Correct", draftKey);
    await context.setOffline(true);
    await page.getByRole("button", { name: /Wrong/ }).click();
    await page.waitForFunction((key) => Object.values(JSON.parse(localStorage.getItem(key) || "{}")).some((value: any) => value.value === "Wrong"), draftKey);
    await context.setOffline(false);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /Wrong/, pressed: true }).waitFor({ timeout: 30000 });
    await page.unroute("**/api/ujian/response");
    await page.getByText("Semua jawaban tersimpan di server", { exact: true }).waitFor({ timeout: 20000 });
    assert.equal((await db.response.findUniqueOrThrow({ where: { attemptId_questionId: { attemptId: session.id, questionId: questionIds[0] } } })).content, "Wrong");
    await page.getByRole("button", { name: /Correct/ }).click();
    await page.getByText("Semua jawaban tersimpan di server", { exact: true }).waitFor({ timeout: 20000 });
    await mkdir("test-artifacts", { recursive: true });
    await page.screenshot({ path: "test-artifacts/exam-desktop.png", fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: "test-artifacts/exam-mobile.png", fullPage: true });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.route("**/api/ujian/submit", (route) => route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ message: "Simulasi gagal submit" }) }));
    await page.getByRole("button", { name: "Kumpulkan Jawaban", exact: true }).click();
    await page.getByRole("button", { name: "Kumpulkan", exact: true }).click();
    await page.getByRole("alert").filter({ hasText: "Simulasi gagal submit" }).waitFor();
    assert.ok(page.url().includes("/ujian/"));
    assert.equal((await db.attempt.findUniqueOrThrow({ where: { id: session.id } })).completedAt, null);
    await page.unroute("**/api/ujian/submit");
    await page.getByRole("button", { name: "Kumpulkan", exact: true }).click();
    await page.waitForURL(`**/hasil/${session.id}`, { timeout: 30000 });
    assert.equal((await db.attempt.findUniqueOrThrow({ where: { id: session.id } })).score, 5);
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), draftKey), null);
    assert.deepEqual(pageErrors, []);
  } finally { await browser.close(); }
});
