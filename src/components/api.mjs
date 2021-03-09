import {tokenPromise} from './security.mjs'
import urls from './urls.json'
import {csv} from 'd3-fetch'
import {EJSON} from 'bson'

const {serviceUrl} = urls

const get_headers = async () => ({
    'Access-Control-Allow-Headers':['Authorization'],
    'Authorization': "Bearer "+ await tokenPromise(),
    'Content-Type': 'application/json'
})

const onServer = (typeof window == 'undefined')
const nothing = Promise.resolve([])

export const db_url = (dbName, collectionName) => `${serviceUrl}/api/${dbName}/${collectionName}`
export const fetch_csv = async (method, url, body) => onServer? await nothing : await csv(url, {method, headers: {Accept:"text/csv", ...await get_headers()}, body: body?EJSON.stringify(body):undefined})
export const fetch_json = async (method, url, body) => onServer? await nothing : await fetch(url, {method, headers: await get_headers(), body: body?EJSON.stringify(body):undefined}).then(response => response.json())

export const api_url = (service) => `${serviceUrl}/api/${service}`
export const admin_url = (service) => `${serviceUrl}/admin/${service}`
export const query = (dbName, collectionName, q) => fetch_csv('POST', db_url(dbName,collectionName), q)

export const queryRunnerFor = url => q => fetch_csv('POST', url, q)
export const queryRunnerFor2 = url => q => fetch_json('POST', url, q)

export const get_api = (service) => fetch_json('GET', api_url(service))
export const post_api = (service,q) => fetch_json('POST', api_url(service),q)

export const listDatabases = () => get_api("/")
export const listCollections = (db) => get_api(`/${db}`)
export const listNodes = () => get_api(`/admin/${db}`)

const put_admin = (service,q) => fetch_json('PUT', admin_url(service),q)
const del_admin = (service,q) => fetch_json('DELETE', admin_url(service),q)

export const addCollection = (db,collection) => put_admin("db",{db,collection})
export const addLink = (parent,child) => put_admin("createLink",{parent,child})
export const addNewTag = (parent,child) => put_admin("addNode",{parent,child})
export const deleteNode = (node) => del_admin("node",{node})
export const updateSchema = (node, schema) => put_admin('schema', {node,schema})
export const setRestriction = (db,collection,node,permission,restriction) => put_admin("restriction", {db,collection,node,permission,restriction})
export const normalise = (q) => EJSON.serialize(q)
