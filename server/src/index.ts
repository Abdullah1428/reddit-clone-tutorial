import 'reflect-metadata'
import { MikroORM } from '@mikro-orm/core'
// constants
import { __prod__, COOKIE_NAME } from './constants'
// micro-orm config
import microConfig from './mikro-orm.config'

import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'

// resolvers for building graphQL Schema
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'

// for storing session details in
// in-memory db known as Redis
import redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'

// type for context
import { MyContext } from './types'

// cors
import cors from 'cors'

const main = async () => {
  const orm = await MikroORM.init(microConfig)
  await orm.getMigrator().up()

  const app = express()

  app.set('trust proxy', 1)

  const RedisStore = connectRedis(session)
  const redisClient = redis.createClient()
  app.use(
    cors({
      origin: `http://localhost:3000`,
      credentials: true
    })
  )
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true, // not accessible in js on front end
        sameSite: 'lax', // protecting against csrf
        secure: false // cookie only works in https
      },
      saveUninitialized: false,
      secret: 'later-on-env-variable',
      resave: false
    })
  )

  const apolloserver = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
  })

  apolloserver.applyMiddleware({
    app,
    cors: false
  })

  app.listen(4000, () => {
    console.log('server started on localhost:4000')
  })
}

main().catch(err => {
  console.error(err)
})
