import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import { graphql, validate, parse } from 'graphql';
import depthLimit from 'graphql-depth-limit';

import { getDataloaders } from './dataloaders.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {

      const depthLimitError = validate(schema, parse(req.body.query), [depthLimit(5)]);
      if (depthLimitError.length) {
        return { errors: depthLimitError };
      }

      const dataloaders = getDataloaders(fastify);

      return await graphql({
        schema,
        source: req.body.query,
        contextValue: { fastify, dataloaders },
        variableValues: req.body.variables,
      });
    },
  });
};

export default plugin;
