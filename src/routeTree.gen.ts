/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'
import { Route as SimuladorPracticaSecuenciaImport } from './routes/simulador/practica-secuencia'
import { Route as ConceptosSecuenciaImport } from './routes/conceptos/secuencia'

// Create/Update Routes

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const SimuladorPracticaSecuenciaRoute = SimuladorPracticaSecuenciaImport.update(
  {
    id: '/simulador/practica-secuencia',
    path: '/simulador/practica-secuencia',
    getParentRoute: () => rootRoute,
  } as any,
)

const ConceptosSecuenciaRoute = ConceptosSecuenciaImport.update({
  id: '/conceptos/secuencia',
  path: '/conceptos/secuencia',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/conceptos/secuencia': {
      id: '/conceptos/secuencia'
      path: '/conceptos/secuencia'
      fullPath: '/conceptos/secuencia'
      preLoaderRoute: typeof ConceptosSecuenciaImport
      parentRoute: typeof rootRoute
    }
    '/simulador/practica-secuencia': {
      id: '/simulador/practica-secuencia'
      path: '/simulador/practica-secuencia'
      fullPath: '/simulador/practica-secuencia'
      preLoaderRoute: typeof SimuladorPracticaSecuenciaImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/conceptos/secuencia': typeof ConceptosSecuenciaRoute
  '/simulador/practica-secuencia': typeof SimuladorPracticaSecuenciaRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/conceptos/secuencia': typeof ConceptosSecuenciaRoute
  '/simulador/practica-secuencia': typeof SimuladorPracticaSecuenciaRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/conceptos/secuencia': typeof ConceptosSecuenciaRoute
  '/simulador/practica-secuencia': typeof SimuladorPracticaSecuenciaRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/conceptos/secuencia' | '/simulador/practica-secuencia'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/conceptos/secuencia' | '/simulador/practica-secuencia'
  id:
    | '__root__'
    | '/'
    | '/conceptos/secuencia'
    | '/simulador/practica-secuencia'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  ConceptosSecuenciaRoute: typeof ConceptosSecuenciaRoute
  SimuladorPracticaSecuenciaRoute: typeof SimuladorPracticaSecuenciaRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  ConceptosSecuenciaRoute: ConceptosSecuenciaRoute,
  SimuladorPracticaSecuenciaRoute: SimuladorPracticaSecuenciaRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/conceptos/secuencia",
        "/simulador/practica-secuencia"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/conceptos/secuencia": {
      "filePath": "conceptos/secuencia.tsx"
    },
    "/simulador/practica-secuencia": {
      "filePath": "simulador/practica-secuencia.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
