import { AuthRepository } from "../../domain/repositories/AuthRepository";
import { AuthUser } from "../entities/AuthUser";

export class SignupUseCase {
  constructor(private repo: AuthRepository) {}

  async execute(email: string, password: string): Promise<AuthUser> {
    // repo.signup currently performs the remote signup and doesn't return the user
    // so call it and then return a lightweight AuthUser object for the presentation layer
    await this.repo.signup(email, password);
    return { email, password } as AuthUser;
  }
}