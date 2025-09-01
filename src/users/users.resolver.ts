import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Public } from '../auth/public.decorator';
import { CreateUserInput } from './dto/create-user.input';
import { LoginInput } from './dto/login.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { LoginResponse } from './models/login.models';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  findAllUsers() {
    return this.usersService.findAll();
  }

  @Query(() => User, { nullable: true })
  findOneUser(@Args('id') id: string) {
    return this.usersService.findOne({ id });
  }

  @Public()
  @Mutation(() => User)
  createUser(@Args('input') input: CreateUserInput) {
    return this.usersService.create(input);
  }

  @Mutation(() => User)
  updateUser(@Args('input') input: UpdateUserInput) {
    return this.usersService.update(input);
  }

  @Mutation(() => Boolean)
  deleteUser(@Args('id') id: string) {
    return this.usersService.remove(id);
  }

  @Mutation(() => User)
  upsertUser(@Args('input') input: CreateUserInput) {
    return this.usersService.upsert(input);
  }

  @Public()
  @Mutation(() => LoginResponse)
  async login(@Args('input') input: LoginInput) {
    return this.usersService.login(input);
  }
}
