import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType({ isAbstract: true })
export class LoginResponse {
  @Field()
  accessToken!: string;

  @Field(() => User)
  user!: User;
}
