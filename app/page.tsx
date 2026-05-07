"use client";
import Image from "next/image";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faEnvelope,
  faIdCard,
  faKey,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [loginValue, setLoginValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "Please sign in to continue"
  );
  const [statusType, setStatusType] = useState<"default" | "error" | "success">(
    "default"
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setStatusType("default");
    setStatusMessage("Checking credentials...");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loginValue,
          passwordValue,
        }),
      });

      const data = await res.json();

      // cek dari metadata.error
      if (data?.metadata?.error !== 0) {
        setStatusType("error");
        setStatusMessage(data?.metadata?.message || "Login gagal.");
        return;
      }

      // success
      setStatusType("success");
      setStatusMessage("Login berhasil, mengalihkan...");

      setTimeout(() => {
        router.push("/karyawan");
      }, 1000);
    } catch (error) {
      setStatusType("error");
      setStatusMessage("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <form
        onSubmit={handleLogin}
        className="sm:w-[350px] w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white"
      >
        {/* <h1 className="text-gray-900 text-3xl mt-10 font-medium">Login</h1> */}
        <Image
          src={"/image/images.jpeg"}
          width={450}
          height={150}
          alt="Logo"
          className="mt-10"
        />
        <p
          className={`text-sm mt-2 transition-all duration-300 ${
            statusType === "error"
              ? "text-red-500"
              : statusType === "success"
              ? "text-green-600"
              : "text-gray-500"
          }`}
        >
          {statusMessage}
          {errorMessage && (
            <>
              <FontAwesomeIcon
                icon={faSpinner}
                className="transition-all duration-300 animate-spin"
              ></FontAwesomeIcon>
            </>
          )}
        </p>
        <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          {/* <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail-icon lucide-mail"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> */}
          <FontAwesomeIcon icon={faIdCard}></FontAwesomeIcon>
          <input
            type="text"
            name="username"
            placeholder="Email"
            className="border-none outline-none ring-0"
            value={loginValue}
            onChange={(e) => {
              setLoginValue(e.target.value);
              setStatusType("default");
              setStatusMessage("Please sign in to continue");
            }}
            required
          />
        </div>
        <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          {/* <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock-icon lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> */}
          <FontAwesomeIcon icon={faKey}></FontAwesomeIcon>

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="border-none outline-none ring-0"
            value={passwordValue}
            onChange={(e) => {
              setPasswordValue(e.target.value);
              setStatusType("default");
              setStatusMessage("Please sign in to continue");
            }}
            required
          />
        </div>
        {/* <div className="mt-4 text-left text-indigo-500">
                    <button className="text-sm" type="reset">Forget password?</button>
                </div> */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity mb-11"
        >
          {/* {state === "login" ? "Login" : "Sign up"} */}
          {loading ? (
            <>
              <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
            </>
          ) : (
            "Sign In"
          )}
        </button>
        {/* <p onClick={() => setState(prev => prev === "login" ? "register" : "login")} className="text-gray-500 text-sm mt-3 mb-11">{state === "login" ? "Don't have an account?" : "Already have an account?"} <a href="#" className="text-indigo-500 hover:underline">click here</a></p> */}
      </form>
    </div>
  );
}
