import {
  Resolver,
  Mutation,
  InputType,
  Field,
  Arg,
  Ctx,
  ObjectType
} from 'type-graphql'
import { MyContext } from '../types'
import { User } from '../entities/User'
import argon2 from 'argon2'

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
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UserArgsInput,
    @Ctx() { em }: MyContext
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
    const user = em.create(User, {
      username: options.username,
      password: hashPassword
    })

    try {
      await em.persistAndFlush(user)
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

    return {
      user
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UserArgsInput,
    @Ctx() { em }: MyContext
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

    return {
      user
    }
  }
}
