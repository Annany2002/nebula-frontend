export const loadSignIn = () => import("@/pages/SignIn");
export const loadSignUp = () => import("@/pages/SignUp");
export const loadForgotPassword = () => import("@/pages/ForgotPassword");
export const loadResetPassword = () => import("@/pages/ResetPassword");
export const loadVerifyEmail = () => import("@/pages/VerifyEmail");

export function preloadAuthPages() {
  // A failed speculative download must not break the current form or cache a rejected promise.
  void Promise.allSettled([
    loadSignIn(),
    loadSignUp(),
    loadForgotPassword(),
    loadResetPassword(),
    loadVerifyEmail(),
  ]);
}
