"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   setIsLoading(true);
  //   console.log(email)
  //   console.log(password)
  //   const signInData = await signIn('credentials', {
  //     email : email,
  //     password : password
  //   })
  //   console.log(signInData);
  // };
  const handleSubmit = async (event:any) => {
    event.preventDefault();
    setError(""); // Clear any previous errors
    setIsLoading(true);

    const result = await signIn("credentials", {
      redirect: false, // Tell NextAuth.js not to redirect after sign-in
      email: email,
      password: password
    });
    // console.log(result)

    // Check if signIn was successful
    if (result?.ok) {
      router.push('/dashboard'); // Redirect to the URL provided by NextAuth.js or a desired path
    } else {
      setError("Login failed. Check your email and password.");
      setIsLoading(false); // Stop loading state
    }
  };

  return (
    <>
      <div className="h-screen bg-gray-100 flex items-center py-16">
        <main className="w-full max-w-md mx-auto p-6">
          <div className="mt-7 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="p-4 sm:p-7">
              <div className="text-center">
                <h1 className="block text-2xl font-bold text-gray-800 font-poppins ">
                  Masuk
                </h1>
                <p className="mt-2 text-sm text-gray-600 font-poppins">
                  Belum punya akun?{" "}
                  <a
                    className="text-[#FFAF35] decoration-2 hover:underline font-medium dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                    href="/auth/sign-up"
                  >
                    Buat akun disini{" "}
                  </a>
                </p>
              </div>

              <div className="mt-5">
                <div className="py-3 flex items-center text-xs text-gray-400 uppercase before:flex-[1_1_0%] before:border-t before:border-gray-200 before:me-6 after:flex-[1_1_0%] after:border-t after:border-gray-200 after:ms-6 dark:text-gray-500 dark:before:border-gray-600 dark:after:border-gray-600">
                  Or
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid gap-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block  mb-2 dark:text-black text-md "
                      >
                        Email
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="email"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="py-3 px-4 block w-full border border-gray-400 rounded-lg text-sm  focus:ring focus:ring-blue-500 outline-none disabled:opacity-50 disabled:pointer-events-none  "
                          required
                          aria-describedby="email-error"
                        />
                        <div className="hidden absolute inset-y-0 end-0 flex items-center pointer-events-none pe-3">
                          <svg
                            className="h-5 w-5 text-red-500"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                          >
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                          </svg>
                        </div>
                      </div>
                      <p
                        className="hidden text-xs text-red-600 mt-2"
                        id="email-error"
                      >
                        Please include a valid email address so we can get back
                        to you
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <label
                          htmlFor="password"
                          className="block text-md mb-2 text-black"
                        >
                          Password
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="py-3 px-4 block w-full border border-gray-400 rounded-lg text-sm  focus:ring focus:ring-blue-500 outline-none disabled:opacity-50 disabled:pointer-events-none  "
                          required
                          aria-describedby="email-error"
                        />
                        <div className="hidden absolute inset-y-0 end-0 flex items-center pointer-events-none pe-3">
                          <svg
                            className="h-5 w-5 text-red-500"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                          >
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                          </svg>
                        </div>
                      </div>
                      <p
                        className="hidden text-xs text-red-600 mt-2"
                        id="password-error"
                      >
                        8+ characters required
                      </p>
                    </div>

                    <div className="flex items-center"></div>
                    {error && (
                      <p className="text-red-600 text-sm font-semibold font-poppins text-center mb-2">
                        {error}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-[#00ADB5] text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600 font-poppins"
                    >
                      {isLoading ? ( // Mengganti konten button saat loading
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.373A8 8 0 0012 20v4c-4.418 0-8-3.582-8-8h4zM20 12h4a8 8 0 01-8 8v-4c3.627 0 6.373-2.373 8-5.627z"
                          ></path>
                        </svg>
                      ) : (
                        "Masuk"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default LoginPage;
