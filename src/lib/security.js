import createAuth0Client from '@auth0/auth0-spa-js'
import auth_config from './auth_config.json'

export const auth0Promise = typeof window !== 'undefined' ? createAuth0Client(auth_config) : new Promise(() => {})

export const tokenPromise = () => auth0Promise.then(auth0 => auth0.getTokenSilently())
export const userPromise = () =>
  auth0Promise.then(async auth0 => {
    await auth0.getTokenSilently()
    return await auth0.getUser()
  })
export const idTokenClaimsPromise = () =>
  auth0Promise.then(async auth0 => {
    await auth0.getTokenSilently()
    return await auth0.getIdTokenClaims()
  })
export const logout = () => auth0Promise.then(auth0 => auth0.logout({ returnTo: window.location.origin }))

auth0Promise.then(async auth0 => {
  await auth0.handleRedirectCallback().catch(console.error)
  if (!(await auth0.getUser())) {
    auth0.loginWithRedirect({
      redirect_uri: window.location.origin
    })
  }
})
