import createAuth0Client from '@auth0/auth0-spa-js'
import auth_config from './auth_config.json'

const fakeAuth0 = {
  handleRedirectCallback:() => Promise.resolve(),
  isAuthenticated:() => Promise.resolve(false),
  loginWithRedirect:() => {},
  logout:() => {},
  getUser:() => Promise.resolve({
    picture:'/svg/profile-icon.svg',
    nickname:'anonymous',
    email:'anonymous@anonymous.net'
  }),
  getTokenSilently:() => Promise.resolve("none"),
  fake:true
}

const onServer = (typeof window == 'undefined')
export const auth0Promise = onServer?Promise.resolve(fakeAuth0):createAuth0Client(auth_config)
export const userPromise = auth0Promise.then(auth0 => auth0.getUser()).catch(console.log)
export const tokenPromise = auth0Promise.then(auth0 => auth0.getTokenSilently()).catch(console.log)

auth0Promise.then(async auth0 => {
  if (!onServer) {
    const authenticated = await auth0.isAuthenticated()
    if (!authenticated) {
      auth0.handleRedirectCallback().then(login).catch(login)
    }
  }
}).catch(console.log)

export const login = async () => {
  const auth0 = await auth0Promise
  const authenticated = await auth0.isAuthenticated()
  // we only log in if we have to.
  if (!authenticated) {
    auth0.loginWithRedirect({
      redirect_uri: window.location.origin
    })
  }
}

export const logout = () => {
  auth0Promise.then((auth0) => {
      auth0.logout({ returnTo: window.location.origin})
  }).catch(console.log)
}