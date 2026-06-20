/**
 * Single-user mode: every task is attributed to this constant user id.
 * The schema and queries are already keyed on `userId`, so swapping in real
 * authentication later only requires sourcing this value from the session.
 */
export const DEFAULT_USER_ID = "default-user";
