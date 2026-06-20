import { Capacitor } from "@capacitor/core";
import type { ApiClient } from "./types";
import { remoteApi } from "./remoteApi";
import { localApi } from "./localApi";

/**
 * Inside the native Android app there is no backend, so we use the on-device
 * local store. On the web we talk to the Express/PostgreSQL REST API.
 */
export const api: ApiClient = Capacitor.isNativePlatform() ? localApi : remoteApi;
