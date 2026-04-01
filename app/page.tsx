"use client";

import { LoadingState } from "@/app/components/loading-state";
import { SignInView } from "@/app/components/sign-in-view";
import { CompilerWorkspace } from "@/app/components/compiler-workspace";
import { useCompiler } from "@/app/hooks/useCompiler";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const {
    languages,
    language,
    code,
    stdin,
    output,
    loading,
    languageLoading,
    setStdin,
    setCode,
    selectLanguage,
    runCode,
  } = useCompiler();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <LoadingState
        title="Checking session"
        subtitle="Please wait while we verify your sign-in status."
      />
    );
  }

  if (!session) {
    return <SignInView onSignIn={() => signIn("google")} />;
  }

  if (languageLoading) {
    return (
      <LoadingState
        title="Loading languages"
        subtitle="Preparing compiler targets."
      />
    );
  }

  if (languages.length === 0) {
    return (
      <LoadingState
        title="No language data"
        subtitle="Sign out and try again once the backend is available."
      />
    );
  }

  return (
    <CompilerWorkspace
      sessionEmail={session.user?.email}
      languages={languages}
      selectedLanguage={language}
      code={code}
      stdin={stdin}
      output={output}
      loading={loading}
      onSignOut={() => signOut()}
      onLanguageChange={selectLanguage}
      onCodeChange={setCode}
      onStdinChange={setStdin}
      onRun={runCode}
    />
  );
}