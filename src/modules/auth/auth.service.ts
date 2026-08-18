import { AppDataSource } from "../../config/db";
import { User } from "../../entities/User";
import { AppError } from "../../utils/AppError";
import { hashPassword, comparePassword } from "../../utils/password";
import { signToken } from "../../utils/jwt";

const userRepository = AppDataSource.getRepository(User);

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const register = async (input: RegisterInput) => {
  const email = input.email.toLowerCase().trim();

  const existing = await userRepository.findOne({ where: { email } });

  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const user = userRepository.create({
    name: input.name.trim(),
    email,
    password: await hashPassword(input.password),
  });

  await userRepository.save(user);

  const token = signToken({ userId: user.id });

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
  };
};

export const login = async (input: LoginInput) => {
  const email = input.email.toLowerCase().trim();

  const user = await userRepository
    .createQueryBuilder("user")
    .addSelect("user.password")
    .where("user.email = :email", { email })
    .getOne();

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await comparePassword(input.password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = signToken({ userId: user.id });

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
  };
};