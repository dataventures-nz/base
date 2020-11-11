import {tokenPromise} from './security.mjs'
import urls from './urls.json'
import {csv} from 'd3-fetch'
import bson from 'bson'

const {serviceUrl} = urls

const get_headers =  async () =>({
    'Access-Control-Allow-Headers':['Authorization'],
    'Authorization': "Bearer "+ await tokenPromise,
    'Content-Type': 'application/json'
})

export const db_url = (dbName, collectionName) => `${serviceUrl}/api/${dbName}/${collectionName}` 
export const fetch_csv = async (method,url,body) => await csv(url, {method, headers: {Accept:"text/csv", ...await get_headers()}, body: body?bson.EJSON.stringify(body):undefined})
export const fetch_json = async(method, url, body) => await fetch(url, {method, headers: await get_headers(), body: body?bson.EJSON.stringify(body):undefined}).then(response => response.json())

export const api_url = (service) => `${serviceUrl}/api/${service}`
export const query = (dbName, collectionName, q) => fetch_csv('POST', db_url(dbName,collectionName), q)

export const get_api = (service) => fetch_json('GET', api_url(service))
export const post_api = (service,q) => fetch_json('POST', api_url(service),q)

export const listDatabases = () => get_api("/")
export const listCollections = (db) => get_api(`/${db}`)
export const listNodes = () => get_api(`/admin/${db}`)
