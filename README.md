# sveltekit jwt session

## installation

```shell
  // npm
  npm install svelte-kit-jwt-session

  // yarn
  yarn add svelte-kit-jwt-session
  
  // pnpm 
  pnpm add svelte-kit-jwt-session

```

## Usage

hooks.server/index.ts|js


```ts
import { handleSession, type Payloads } from "svelte-kit-jwt-session";

const session = handleSession({
    access: {
        cookieName: "allins_session",
        cookieOptions: {
            path: "/",
            maxAge: 60
        },
        secret: "secretKeyThatIsNotOnGithub"
    },
    refresh: {
        cookieName: "allins_session_reserved",
        cookieOptions: {
            path: "/",
            maxAge: 60 * 60 * 24 * 7
        },
        secret: 'ssssssh!'
    }
})

export const handle: Handle = session

// if you want to use handle hook use sequence helper method
// export const handle = sequence(anotherHook, session)
```


and app.d.ts 
```ts
declare namespace App {
	interface Locals {
		session: import("svelte-kit-jwt-session").LocalType;
	}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}
}

```
## Login

routes/login/+page.server.ts or whatever you want
```ts
import { type Action, type Actions, redirect } from "@sveltejs/kit"
import { login  }from "svelte-kit-jwt-session";

const loginAction: Action = (event) => {
   // do your logic ...

   /**
    * @param { import("svelte-kit-jwt-session").Payloads }  payloads 
    */
   login({ accessPayload: { sub: "j@doe" , role: "admin"}, refreshPayload: { sub: "j@doe"}})

   throw redirect(302, "/")
}

export const actions: {
    login: loginAction
}

```

## Access session

+layout.server.ts
```ts
 import type { ServerLoad } from "@sveltejs/kit";
  export const load: ServerLoad = ({locals}) => {

    // session accessible on locals.session

    return {
        session: locals.session
    }
  }
```

## Reauth
if you want to renew your access token automatically upon expiration
```ts

const session = handleSession({
    access: {...},
    refresh: {...},
    /**
     * @param {JWTPayload | string} refreshToken
     * @return { import("svelte-kit-jwt-session").Payloads }
     */
    reauth: (refreshTokenPayload) => {
        // do your logic here
        
        
        return {
            accessPayload: refreshTokenPayload,
            refreshPayload: refreshTokenPayload
        }
    }
})


```