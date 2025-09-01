import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/create-user.input';
import { LoginInput } from './dto/login.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepo.find();
  }

  async findOne(where: Partial<User>): Promise<User> {
    const user = await this.usersRepo.findOne({ where });
    if (!user) {
      throw new Error(`User not found with ${JSON.stringify(where)}`);
    }
    return user;
  }

  async findOneWithEmail(email: string): Promise<User | null> {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (user) {
      return user;
    }
    return null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const existingUser = await this.findOneWithEmail(input.email);
    if (existingUser)
      throw new HttpException(
        { message: 'User already exists', error_code: 'USER_ALREADY_EXISTS' },
        HttpStatus.BAD_REQUEST,
      );

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const newUser = this.usersRepo.create({
      ...input,
      password: hashedPassword,
    });
    return this.usersRepo.save(newUser);
  }

  async update(input: UpdateUserInput): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id: input.id } });
    if (!user) throw new Error('User not found');

    if (input.password) {
      input.password = await bcrypt.hash(input.password, 10);
    }

    Object.assign(user, input);
    return this.usersRepo.save(user);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.usersRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async upsert(input: CreateUserInput): Promise<User> {
    const existingUser = await this.usersRepo.findOne({
      where: { email: input.email },
    });

    if (existingUser) {
      existingUser.name = input.name;
      existingUser.phone = input.phone;
      if (input.password) {
        existingUser.password = await bcrypt.hash(input.password, 10);
      }
      return this.usersRepo.save(existingUser);
    }

    return this.create(input);
  }
  async validateUser(email: string, password: string) {
    const user = await this.findOneWithEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }
  async login(input: LoginInput) {
    const user = await this.validateUser(input.email, input.password);

    const payload = { id: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    });

    return {
      accessToken: token,
      user,
    };
  }
}
