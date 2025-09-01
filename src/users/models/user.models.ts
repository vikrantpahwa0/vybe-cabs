import { Field, HideField, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserModel {
  @Field(() => String)
  id!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @HideField()
  password!: string;

  @Field()
  phone!: string;

  @Field()
  role!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
