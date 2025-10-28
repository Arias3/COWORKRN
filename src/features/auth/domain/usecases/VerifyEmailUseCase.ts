import { AuthRepository } from "../repositories/AuthRepository";

export class VerifyEmailUseCase {
  constructor(private repo: AuthRepository) {}

  async execute(email: string, code: string): Promise<boolean> {
    return this.repo.validate(email, code);
  }
}
