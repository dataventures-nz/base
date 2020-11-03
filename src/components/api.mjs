import {tokenPromise} from 'security.mjs'
import {serviceUrl} from './urls.json'
const get_headers =  async () =>({
    'Access-Control-Allow-Headers':['Authorization'],
    'Authorization': "Bearer "+ await tokenPromise,
    'Content-Type': 'application/json'
})

export const fetch_csv = async (method,url,body) => await fetch(url, {method, headers: await get_headers(), body: body ?? JSON.stringify(body)}).then(response => response.json())
export const db = (dbName, collectionName) => `${serviceUrl}/api/${dbName}/${collectionName}` 
export const query = (dbName, collectionName, q) => fetch_csv('POST', db(dbName,collectionName), q)


// const fetch_ejson = async(method,url,body) => fetch(url, {method, headers: await get_headers(), body: body ?? JSON.stringify(body)}).then(response => response.json())
// const fetch_bjson = async(method,url,body) => fetch(url, {method, headers: await get_headers(), body: body ?? JSON.stringify(body)}).then(response => response.json())
// const fetch_json = async(method,url,body) => fetch(url, {method, headers: await get_headers(), body: body ?? JSON.stringify(body)}).then(response => response.json())

const get_options = async () => ({
    method: 'GET',
    headers: await get_headers()
})

const post_options = async (body) => ({
    method: 'POST',
    headers: await get_headers(),
    body: JSON.stringify(body)
})

const put_options = async (body) => ({
    method: 'PUT',
    headers: await get_headers(),
    body: JSON.stringify(body)
})

const patch_options = async (body) => ({
    method: 'PATCH',
    headers: await get_headers(),
    body: JSON.stringify(body)
})

const download = (filename) => (res) => {
    const blob = res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
}

export const get_json = (url, service) => fetch(url +"/api/" + service, await get_options()).then(response => response.json())
export const post_json = (url, service, body) => fetch(url +"/api/" + service, await post_options(body)).then(response => response.json())
export const patch_json = (url, service, body) => fetch(url +"/api/" + service, await get_options(body)).then(response => response.json())
export const get_json_url = (url) => fetch(url, await get_options()).then(response => response.json())
export const post_json_url = (url, json) => fetch(url, await post_options(json)).then(response => response.json())

export async function get_download(url,service,filename) {
    filename = filename || service + ".csv"
    fetch(url +"/api/" + service, await get_options())
      .then( download(filename) )
}

export async function post_download(url,service,query,filename) {
  filename = filename || service + ".csv"
  fetch(url +"/api/" + service, await post_options(query))
    .then(download(filename))
}

export const listDatabases = () => get_json_url("/api")
export const listCollections = (db) => get_json_url(`/api/${db}`)
export const listNodes = () => get_json_url(`/api/${db}`)
