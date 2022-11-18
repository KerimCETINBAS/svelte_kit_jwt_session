/// <reference types="@sveltejs/kit" />

import type { JwtPayload } from "jsonwebtoken";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	type LocalType = import("./lib/index").LocalType
	interface Locals {
		session: LocalType;
	}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}
}
