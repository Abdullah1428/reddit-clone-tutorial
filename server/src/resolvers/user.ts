import {
  Resolver,
  Mutation,
  InputType,
  Field,
  Arg,
  Ctx,
  ObjectType,
  Query
} from 'type-graphql'
import { MyContext } from '../types'
import { User } from '../entities/User'
import argon2 from 'argon2'
import { EntityManager } from '@mikro-orm/postgresql'
import { COOKIE_NAME } from '../constants'

// input type only used for input args
@InputType()
class UserArgsInput {
  @Field(() => String)
  username: string
  @Field(() => String)
  password: string
}

// particular field error
@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

// obejct type can be returned
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  // me query if logged in or not
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    if (!req.session.userId) {
      return null
    }

    const user = await em.findOne(User, { id: req.session.userId })

    return user
  }

  // user register
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UserArgsInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'length must be greater than 2'
          }
        ]
      }
    }

    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: 'password',
            message: 'length must be greater than 2'
          }
        ]
      }
    }

    const hashPassword = await argon2.hash(options.password)

    /*
    const user = em.create(User, {
      username: options.username,
      password: hashPassword
    })
    */
    let user
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          password: hashPassword,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*')

      user = result[0]
      //await em.persistAndFlush(user)
    } catch (error) {
      // duplicate username
      if (error.code === '23505' || error.detail.includes('already exists')) {
        return {
          errors: [
            {
              field: 'username',
              message: 'username already exists/taken'
            }
          ]
        }
      }
    }

    // store user id session and set cookie and will login user
    req.session.userId = user.id

    return {
      user
    }
  }

  // user login
  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UserArgsInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username })
    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: 'Invalid credentials'
          }
        ]
      }
    }

    const valid = await argon2.verify(user.password, options.password)
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Invalid credentials'
          }
        ]
      }
    }

    // store user id session and set cookie and will login user
    req.session.userId = user.id

    return {
      user
    }
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise(resolve =>
      req.session.destroy(err => {
        res.clearCookie(COOKIE_NAME)
        if (err) {
          resolve(false)
          return
        }

        resolve(true)
      })
    )
  }
}
