"use client";

import { useState, useCallback } from "react";

// Validates GitHub repo URLs like:
//   https://github.com/owner/repo
//   https://github.com/owner/repo.git
//   github.com/owner/repo
const GITHUB_URL_REGEX = /^(https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\.git)?\/?$/;

interface RepoInputProps {
  onSubmit: (repoUrl: string) => void;
  isLoading?: boolean;
}

/**
 * GitHub URL input with validation.
 * Terminal-card aesthetic: dark bg, mono hints, accent CTA.
 */
export default function RepoInput({ onSubmit, isLoading = false }: RepoInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const isValid = GITHUB_URL_REGEX.test(url.trim());

  const handleSubmit = useCallback(() => {
    const trimmed = url.trim();
    if (!GITHUB_URL_REGEX.test(trimmed)) {
      setError("Enter a valid GitHub repository URL");
      return;
    }
    setError("");
    // Normalize to full URL
    const fullUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    onSubmit(fullUrl);
  }, [url, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && isValid && !isLoading) {
        handleSubmit();
      }
    },
    [handleSubmit, isValid, isLoading]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    // Auto-detect pasted GitHub URLs
    const pasted = e.clipboardData.getData("text").trim();
    if (GITHUB_URL_REGEX.test(pasted)) {
      setError("");
    }
  }, []);

  return (
    <div className="da-repo-input">
      <div className="da-repo-input__chrome">
        <span className="da-terminal__dot da-terminal__dot--red" />
        <span className="da-terminal__dot da-terminal__dot--yellow" />
        <span className="da-terminal__dot da-terminal__dot--green" />
        <span className="da-repo-input__chrome-title">devaudit — new audit</span>
      </div>

      <div className="da-repo-input__body">
        <div className="da-repo-input__prompt">
          <span className="da-repo-input__prompt-symbol">$</span>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="https://github.com/owner/repo"
            className="da-repo-input__field"
            autoComplete="url"
            spellCheck={false}
            disabled={isLoading}
          />
        </div>

        {error && <p className="da-repo-input__error">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className="da-btn da-btn--accent da-btn--large da-repo-input__submit"
        >
          {isLoading ? (
            <>
              <span className="da-repo-input__spinner" />
              Scanning…
            </>
          ) : (
            "Audit Your Repo"
          )}
        </button>
      </div>
    </div>
  );
}
