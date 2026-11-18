import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { GET } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { useAuth } from "@/hooks/useAuth";

export default function DigiLockerCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn } = useAuth();
  const [message, setMessage] = useState("Completing DigiLocker verification...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
      return;
    }

    const state = searchParams.get("state") || "";
    const recordId = searchParams.get("recordId") || searchParams.get("record_id") || "";
    const code = searchParams.get("code") || "";
    const codeVerifier =
      searchParams.get("codeVerifier") || searchParams.get("code_verifier") || "";

    if (!state) {
      setIsError(true);
      setMessage("Missing verification state. Please try again from agent registration.");
      return;
    }

    if (!code) {
      setIsError(true);
      setMessage("Authorization was not completed at DigiLocker. Please try again.");
      return;
    }

    const completeVerification = async () => {
      try {
        await GET(API.DIGILOCKER.COMPLETE, { state, recordId, code, codeVerifier });
        navigate("/agent-registration?digilocker=verified", { replace: true });
      } catch (err: unknown) {
        const text =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "DigiLocker verification failed. Please try again.";
        setIsError(true);
        setMessage(text);
      }
    };

    completeVerification();
  }, [isLoggedIn, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4">
      <div className="max-w-md w-full rounded-2xl border border-border bg-white p-8 text-center shadow-[var(--shadow-card)]">
        {isError ? (
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        ) : (
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        )}
        <h1 className="mt-4 text-body-lg fw-bold text-foreground">
          {isError ? "Verification Failed" : "Verifying with DigiLocker"}
        </h1>
        <p className="mt-2 text-body-sm text-muted-foreground">{message}</p>
        {isError && (
          <Link
            to="/agent-registration"
            className="inline-flex items-center gap-2 mt-6 text-body-sm fw-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Agent Registration
          </Link>
        )}
        {!isError && (
          <p className="mt-4 text-caption text-muted-foreground inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Please wait while we confirm your verification
          </p>
        )}
      </div>
    </div>
  );
}
