
import type { Handle, RequestEvent  } from "@sveltejs/kit"
import type { CookieSerializeOptions } from "cookie"
import { sign, verify, type JwtPayload } from "jsonwebtoken"
 
export type Payloads = { accessPayload: string | object, refreshPayload: string | object }
export type LocalType =  object | JwtPayload | Record<string,unknown> | undefined
let access: {
        secret: string,
        cookieName: string,
        cookieOptions: CookieSerializeOptions
    };
let refresh: {
        secret: string,
        cookieName: string,
        cookieOptions: CookieSerializeOptions
    };
let reauth:  undefined | ((data: unknown) => Payloads)
/**
 * @param {RequestEvent} event server request event
 * @param {string | object} data_access jwt payload for access token, if data passed as object it serialize with JSON.stringfy
 * @param {string | object} data_access jwt payload for refresh token, if data passed as object it serialize with JSON.stringfy
 */
export async function login(event: RequestEvent, payloads: Payloads ) {
    const accessPayload = (await payloads).accessPayload
    const refreshPayload = (await payloads).refreshPayload

    const accessToken = sign(accessPayload, access.secret)
    const refreshToken = sign(refreshPayload, refresh.secret)
    event.cookies.set(refresh.cookieName, refreshToken, {...access.cookieOptions})
    event.cookies.set(access.cookieName, accessToken, { ...access.cookieOptions })
    event.locals.session = payloads.accessPayload as LocalType 
}

/**
 * @description set locals.session with jwt payload if token is valid
 * @param { RequestEvent } event svelte kit server request event 
 * @returns { boolean } return boolean depeds on jwt is valit or not
 */
function verifyAccessToken(event: RequestEvent): boolean {
    const accessToken = event.cookies.get(access.cookieName)

    if (accessToken) {
        try {
            event.locals.session = verify(accessToken, access.secret) as object
            return true
        } catch (error) {
            return false
        }

    }
    return false
}

/**
 * 
 * @param {RequestEvent} event svelte-kits request event 
 * @returns jwt payload if token is valid otherwise return false
 */

function verifyRefreshToken(event: RequestEvent): false | JwtPayload | string {
    const refreshToken = event.cookies.get(refresh.cookieName)

    if (refreshToken) {
        try {
          return verify(refreshToken, refresh.secret)
        } catch (error) {
          return false
        }
    }
    return false
}
    /**
     * @description return session hooks for sveltekit server.hooks
     * @param sessionOptions options
     * @return { SvelteKit.Handle} return handle function use it with { sequence } to use with other hooks
     */
export const handleSession = (sessionOptions: {

    /**
     * @optional if defined, new access token generated with refresh token
     * @description takes access token payload as data and return login data
     * @param {unknown} data
     * @return {unknown} login data
     */
    reauth?: (data: unknown) => Payloads,

    /**
     * @description regenerate refresh token on use
     * @default true
     */
    regenerateRefreshToken?: boolean,
    /**
     * @description cookieoptions.maxAge as token lifespan do not set expires option
     */
    access: {
        secret: string,
        cookieName: string,
        cookieOptions: CookieSerializeOptions
    },
    refresh: {
        secret: string,
        cookieName: string,
        cookieOptions: CookieSerializeOptions
    }
}): Handle => {
    // set access and refresh token globally when session hook registered
    access = sessionOptions.access
    refresh = sessionOptions.refresh
    reauth = sessionOptions.reauth

    return async ({ event, resolve }) => {

       
       if (!verifyAccessToken(event)) {
        
           if (reauth) {
               
                const refreshData = verifyRefreshToken(event)
             
               if(refreshData) 
                    login(event, reauth(refreshData))
               
           }
       } 
      
        return await resolve(event)

    }

}
