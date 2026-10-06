import {LOCALHOST}  from './config.js'

export const openapiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'API REST Users',
    version: '1.0.0',
    description: 'API REST en Express + PostgreSQL con campo JSONB'
  },
  servers: [{ url: `${LOCALHOST}` }],
  components: {
    schemas: {
      Profile: {
        type: 'object',
        additionalProperties: true,
        example: {
          hobbies: ['Guitarra', 'Running'],
          address: { city: 'Ciudad de México', country: 'México' },
          preferences: { theme: 'dark', notifications: true }
        }
      },
      User: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          id: { type: 'integer', readOnly: true, example: 1 },
          name: { type: 'string', maxLength: 100, example: 'Carlos Rodríguez' },
          email: {
            type: 'string',
            format: 'email',
            maxLength: 250,
            example: 'carlos.rodriguez@example.com'
          },
          edad: { type: 'integer', nullable: true, example: 29 },
          profile: { $ref: '#/components/schemas/Profile' },
          created_at: { type: 'string', format: 'date-time', readOnly: true }
        }
      },
      Error: {
        type: 'object',
        properties: { message: { type: 'string', example: 'Usuario no encontrado' } }
      }
    },
    responses: {
      NotFound: {
        description: 'Usuario no encontrado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      }
    }
  },
  paths: {
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Lista todos los usuarios',
        responses: {
          200: {
            description: 'Lista de usuarios',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/User' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['Users'],
        summary: 'Crea un usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
            }
          }
        },
        responses: {
          201: {
            description: 'Usuario creado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/User' } }
            }
          }
        }
      }
    },
    '/users/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          example: 1
        }
      ],
      get: {
        tags: ['Users'],
        summary: 'Obtiene un usuario por id',
        responses: {
          200: {
            description: 'Usuario',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/User' } }
            }
          },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      put: {
        tags: ['Users'],
        summary: 'Actualiza un usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/User' } }
          }
        },
        responses: {
          200: {
            description: 'Usuario actualizado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/User' } }
            }
          },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      delete: {
        tags: ['Users'],
        summary: 'Elimina un usuario',
        responses: {
          200: {
            description: 'Usuario eliminado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Usuario eliminado' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    }
  }
};
