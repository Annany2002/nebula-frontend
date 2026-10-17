import { createAccountLinkStore } from "./accountLink";
const store = createAccountLinkStore("/verify-email");
export const getVerificationLink = store.get;
export const subscribeVerificationLink = store.subscribe;
export const forgetVerificationLink = store.forget;
if (import.meta.hot) import.meta.hot.dispose(store.dispose);
