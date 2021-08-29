import { __prod__ } from './constants'
import { Post } from './entities/Post'
import { User } from './entities/User'
import { MikroORM } from '@mikro-orm/core'
import path from 'path'

export default {
  migrations: {
    path: path.join(__dirname, './migrations'), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/ // regex pattern for the migration files
  },
  entities: [Post, User],
  dbName: 'testredit',
  user: 'abdullah',
  password: '',
  type: 'postgresql',
  debug: !__prod__
} as Parameters<typeof MikroORM.init>[0]

// parameters is typescript property where you can pass types and it will return params of that type
