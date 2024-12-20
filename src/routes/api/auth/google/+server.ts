import { redirect, type RequestEvent } from "@sveltejs/kit";
import { generateCodeVerifier, generateState } from "arctic";

import { google } from "$lib/server/auth";

export async function GET(event: RequestEvent): Promise<Response> {
	if (event.locals.user) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/dashboard",
			},
		});
	}

	const state = generateState();
	const codeVerifier = generateCodeVerifier();

	const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]);

	event.cookies.set("google_oauth_state", state, {
		path: "/",
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax",
	});

	event.cookies.set("google_code_verifier", codeVerifier, {
		path: "/",
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax",
	});

	redirect(302, url.toString());
}
