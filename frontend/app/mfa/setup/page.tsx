"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface MFASetupData {
  qrCode: string;
  secret: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export default function MFASetup() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [mfaSetup, setMfaSetup] = useState<MFASetupData | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [backupCodesSaved, setBackupCodesSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchMFASetup();
    }
  }, [status, router]);

  const fetchMFASetup = async () => {
    try {
      const response = await fetch("/api/mfa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "MFA is already enabled for this account") {
          router.push("/dashboard");
          return;
        }
        throw new Error(data.error || "Failed to setup MFA");
      }

      setMfaSetup(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const verifyMFA = async () => {
    if (!totpCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    if (!backupCodesSaved) {
      setError("Please confirm that you have saved your backup codes");
      return;
    }

    setVerifying(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: totpCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify MFA");
      }

      setSuccess("MFA has been enabled successfully! Redirecting...");
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || !mfaSetup) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Set Up Two-Factor Authentication
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Add an extra layer of security to your account
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Step 1: Scan QR Code
            </h2>
            <div className="flex justify-center mb-4">
              <img 
                src={mfaSetup.qrCode} 
                alt="MFA QR Code" 
                className="w-48 h-48 border-2 border-gray-200 rounded-lg"
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              Scan this QR code with Google Authenticator, Authy, or any other TOTP app
            </p>
          </div>

          {/* Manual Entry Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Step 2: Manual Entry (Alternative)
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secret Key
                </label>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    value={mfaSetup.manualEntryKey}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(mfaSetup.manualEntryKey)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Enter this key manually in your authenticator app if you can't scan the QR code
              </p>
            </div>
          </div>
        </div>

        {/* Backup Codes Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Step 3: Save Backup Codes
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Important: Save these backup codes
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Store these codes in a secure location. You can use them to access your account if you lose access to your authenticator device.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {mfaSetup.backupCodes.map((code, index) => (
              <div
                key={index}
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-center font-mono text-sm"
              >
                {code}
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={backupCodesSaved}
                onChange={(e) => setBackupCodesSaved(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                I have saved my backup codes in a secure location
              </span>
            </label>
          </div>
        </div>

        {/* Verification Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Step 4: Verify Setup
          </h2>
          <div className="max-w-sm mx-auto">
            <div>
              <label htmlFor="totp-code" className="block text-sm font-medium text-gray-700 mb-1">
                Enter 6-digit code
              </label>
              <input
                id="totp-code"
                type="text"
                maxLength={6}
                pattern="[0-9]{6}"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
                placeholder="000000"
              />
            </div>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {success && (
              <div className="mt-4 rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">{success}</div>
              </div>
            )}

            <button
              onClick={verifyMFA}
              disabled={verifying || totpCode.length !== 6 || !backupCodesSaved}
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? "Verifying..." : "Enable Two-Factor Authentication"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}