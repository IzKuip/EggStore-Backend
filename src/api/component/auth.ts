import argon2 from "argon2";
import { UserManagement } from "../../user/main";
import { Api } from "../main";

class AAPI {
  async check(req: Request, res: any) {
    const { username, password } = UserManagement.getAuth(req);

    const authenticated =
      (await UserManagement.validateCredentials(
        username || "",
        password || ""
      )) || false;

    Api.writeError(
      res,
      `Authentication ${authenticated ? "succeeded" : "failed"}`,
      `Authentication for ${username} ${
        authenticated
          ? "was successful"
          : "failed because of invalid credentials"
      }`,
      authenticated
    );
  }

  async encrypt(str: string) {
    return await argon2.hash(str, {
      type: argon2.argon2i,
      memoryCost: 2 ** 16,
      timeCost: 6,
      hashLength: 32,
    });
  }
}

export const AuthAPI = new AAPI();
