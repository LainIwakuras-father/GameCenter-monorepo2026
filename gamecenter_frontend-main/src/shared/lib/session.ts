import { createEvent } from "effector";

/** Clears every store whose contents belong to the current authenticated user. */
export const sessionReset = createEvent();

/** Emitted when an authenticated request can no longer refresh the session. */
export const sessionExpired = createEvent();
