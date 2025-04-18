/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'
import { Route as SimuladorMemoriaImport } from './routes/simulador/memoria'
import { Route as SimuladorEstructuraImport } from './routes/simulador/$estructura'
import { Route as ConceptosEstructuraImport } from './routes/conceptos/$estructura'
import { Route as ConceptosEstructuraOperacionesImport } from './routes/conceptos/$estructura/operaciones'
import { Route as ConceptosEstructuraDefinicionImport } from './routes/conceptos/$estructura/definicion'
import { Route as ConceptosEstructuraComplejidadImport } from './routes/conceptos/$estructura/complejidad'

// Create/Update Routes

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const SimuladorMemoriaRoute = SimuladorMemoriaImport.update({
  id: '/simulador/memoria',
  path: '/simulador/memoria',
  getParentRoute: () => rootRoute,
} as any)

const SimuladorEstructuraRoute = SimuladorEstructuraImport.update({
  id: '/simulador/$estructura',
  path: '/simulador/$estructura',
  getParentRoute: () => rootRoute,
} as any)

const ConceptosEstructuraRoute = ConceptosEstructuraImport.update({
  id: '/conceptos/$estructura',
  path: '/conceptos/$estructura',
  getParentRoute: () => rootRoute,
} as any)

const ConceptosEstructuraOperacionesRoute =
  ConceptosEstructuraOperacionesImport.update({
    id: '/operaciones',
    path: '/operaciones',
    getParentRoute: () => ConceptosEstructuraRoute,
  } as any)

const ConceptosEstructuraDefinicionRoute =
  ConceptosEstructuraDefinicionImport.update({
    id: '/definicion',
    path: '/definicion',
    getParentRoute: () => ConceptosEstructuraRoute,
  } as any)

const ConceptosEstructuraComplejidadRoute =
  ConceptosEstructuraComplejidadImport.update({
    id: '/complejidad',
    path: '/complejidad',
    getParentRoute: () => ConceptosEstructuraRoute,
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
    '/conceptos/$estructura': {
      id: '/conceptos/$estructura'
      path: '/conceptos/$estructura'
      fullPath: '/conceptos/$estructura'
      preLoaderRoute: typeof ConceptosEstructuraImport
      parentRoute: typeof rootRoute
    }
    '/simulador/$estructura': {
      id: '/simulador/$estructura'
      path: '/simulador/$estructura'
      fullPath: '/simulador/$estructura'
      preLoaderRoute: typeof SimuladorEstructuraImport
      parentRoute: typeof rootRoute
    }
    '/simulador/memoria': {
      id: '/simulador/memoria'
      path: '/simulador/memoria'
      fullPath: '/simulador/memoria'
      preLoaderRoute: typeof SimuladorMemoriaImport
      parentRoute: typeof rootRoute
    }
    '/conceptos/$estructura/complejidad': {
      id: '/conceptos/$estructura/complejidad'
      path: '/complejidad'
      fullPath: '/conceptos/$estructura/complejidad'
      preLoaderRoute: typeof ConceptosEstructuraComplejidadImport
      parentRoute: typeof ConceptosEstructuraImport
    }
    '/conceptos/$estructura/definicion': {
      id: '/conceptos/$estructura/definicion'
      path: '/definicion'
      fullPath: '/conceptos/$estructura/definicion'
      preLoaderRoute: typeof ConceptosEstructuraDefinicionImport
      parentRoute: typeof ConceptosEstructuraImport
    }
    '/conceptos/$estructura/operaciones': {
      id: '/conceptos/$estructura/operaciones'
      path: '/operaciones'
      fullPath: '/conceptos/$estructura/operaciones'
      preLoaderRoute: typeof ConceptosEstructuraOperacionesImport
      parentRoute: typeof ConceptosEstructuraImport
    }
  }
}

// Create and export the route tree

interface ConceptosEstructuraRouteChildren {
  ConceptosEstructuraComplejidadRoute: typeof ConceptosEstructuraComplejidadRoute
  ConceptosEstructuraDefinicionRoute: typeof ConceptosEstructuraDefinicionRoute
  ConceptosEstructuraOperacionesRoute: typeof ConceptosEstructuraOperacionesRoute
}

const ConceptosEstructuraRouteChildren: ConceptosEstructuraRouteChildren = {
  ConceptosEstructuraComplejidadRoute: ConceptosEstructuraComplejidadRoute,
  ConceptosEstructuraDefinicionRoute: ConceptosEstructuraDefinicionRoute,
  ConceptosEstructuraOperacionesRoute: ConceptosEstructuraOperacionesRoute,
}

const ConceptosEstructuraRouteWithChildren =
  ConceptosEstructuraRoute._addFileChildren(ConceptosEstructuraRouteChildren)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/conceptos/$estructura': typeof ConceptosEstructuraRouteWithChildren
  '/simulador/$estructura': typeof SimuladorEstructuraRoute
  '/simulador/memoria': typeof SimuladorMemoriaRoute
  '/conceptos/$estructura/complejidad': typeof ConceptosEstructuraComplejidadRoute
  '/conceptos/$estructura/definicion': typeof ConceptosEstructuraDefinicionRoute
  '/conceptos/$estructura/operaciones': typeof ConceptosEstructuraOperacionesRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/conceptos/$estructura': typeof ConceptosEstructuraRouteWithChildren
  '/simulador/$estructura': typeof SimuladorEstructuraRoute
  '/simulador/memoria': typeof SimuladorMemoriaRoute
  '/conceptos/$estructura/complejidad': typeof ConceptosEstructuraComplejidadRoute
  '/conceptos/$estructura/definicion': typeof ConceptosEstructuraDefinicionRoute
  '/conceptos/$estructura/operaciones': typeof ConceptosEstructuraOperacionesRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/conceptos/$estructura': typeof ConceptosEstructuraRouteWithChildren
  '/simulador/$estructura': typeof SimuladorEstructuraRoute
  '/simulador/memoria': typeof SimuladorMemoriaRoute
  '/conceptos/$estructura/complejidad': typeof ConceptosEstructuraComplejidadRoute
  '/conceptos/$estructura/definicion': typeof ConceptosEstructuraDefinicionRoute
  '/conceptos/$estructura/operaciones': typeof ConceptosEstructuraOperacionesRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/conceptos/$estructura'
    | '/simulador/$estructura'
    | '/simulador/memoria'
    | '/conceptos/$estructura/complejidad'
    | '/conceptos/$estructura/definicion'
    | '/conceptos/$estructura/operaciones'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/conceptos/$estructura'
    | '/simulador/$estructura'
    | '/simulador/memoria'
    | '/conceptos/$estructura/complejidad'
    | '/conceptos/$estructura/definicion'
    | '/conceptos/$estructura/operaciones'
  id:
    | '__root__'
    | '/'
    | '/conceptos/$estructura'
    | '/simulador/$estructura'
    | '/simulador/memoria'
    | '/conceptos/$estructura/complejidad'
    | '/conceptos/$estructura/definicion'
    | '/conceptos/$estructura/operaciones'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  ConceptosEstructuraRoute: typeof ConceptosEstructuraRouteWithChildren
  SimuladorEstructuraRoute: typeof SimuladorEstructuraRoute
  SimuladorMemoriaRoute: typeof SimuladorMemoriaRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  ConceptosEstructuraRoute: ConceptosEstructuraRouteWithChildren,
  SimuladorEstructuraRoute: SimuladorEstructuraRoute,
  SimuladorMemoriaRoute: SimuladorMemoriaRoute,
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
        "/conceptos/$estructura",
        "/simulador/$estructura",
        "/simulador/memoria"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/conceptos/$estructura": {
      "filePath": "conceptos/$estructura.tsx",
      "children": [
        "/conceptos/$estructura/complejidad",
        "/conceptos/$estructura/definicion",
        "/conceptos/$estructura/operaciones"
      ]
    },
    "/simulador/$estructura": {
      "filePath": "simulador/$estructura.tsx"
    },
    "/simulador/memoria": {
      "filePath": "simulador/memoria.tsx"
    },
    "/conceptos/$estructura/complejidad": {
      "filePath": "conceptos/$estructura/complejidad.tsx",
      "parent": "/conceptos/$estructura"
    },
    "/conceptos/$estructura/definicion": {
      "filePath": "conceptos/$estructura/definicion.tsx",
      "parent": "/conceptos/$estructura"
    },
    "/conceptos/$estructura/operaciones": {
      "filePath": "conceptos/$estructura/operaciones.tsx",
      "parent": "/conceptos/$estructura"
    }
  }
}
ROUTE_MANIFEST_END */
