import { createAccountLinkStore } from "./accountLink";
const store = createAccountLinkStore("/reset-password");
export const getPasswordResetLink = store.get;
export const subscribePasswordResetLink = store.subscribe;
export const forgetPasswordResetLink = store.forget;
if (import.meta.hot) import.meta.hot.dispose(store.dispose);
