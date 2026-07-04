"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

interface Props {
  onSuccess: (response: CredentialResponse) => void;
  onError?: () => void;
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
}

export default function GoogleSignInButton({ onSuccess, onError, text }: Props) {
  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onError={onError ?? (() => {})}
      width="320"
      text={text}
    />
  );
}
