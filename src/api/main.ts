import { UserAPI} from "./component/user"
import { AuthAPI } from "./component/auth";
import { EggAPI } from "./component/egg";

class API {
  async eval(path: string, req: Request, res: any) {
    let valid = false;
    if (APIPaths.has(path)) {
      valid = true;

      await APIPaths.get(path)?.requestFn(req, res);
    } else {
      valid = false;
    }

    if (!valid) {
      Api.writeError(
        res,
        "Unable to access API",
        "The specified API path doesn't exist"
      );
    }

    res.end();

    console.log(
      `API: eval: generating response for ${
        !valid ? "in" : ""
      }valid request to ${path}`
    );
  }

  createError(
    title: string,
    message?: string
  ): { title: string; message: string } {
    return {
      title,
      message: message || "",
    };
  }

  writeResponse(res: any, response: {}, valid: boolean = true) {
    res.write(
      JSON.stringify({
        valid,
        response,
      })
    );
  }

  writeError(res: any, title: string, message?: string, valid?: boolean) {
    this.writeResponse(
      res,
      {
        error: this.createError(title, message),
      },
      valid || false
    );
  }

  help(req: any, res: any) {
    let json: { path: string; description: string }[] = [];
    for (const path of APIPaths) {
      json.push({
        path: path[0],
        description: path[1].name as string,
      });
    }

    Api.writeResponse(
      res,
      {
        paths: json,
      },
      true
    );
  }
}

export const Api = new API();
export const APIPaths = new Map<string, APIComponent>([
  [
    "/api/eggs/get",
    {
      name: "Gives a list of egg registrations",
      requestFn: EggAPI.get
    }
  ],
  [
    "/api/eggs/register",
    {
      name: "Registers a new egg entry",
      requestFn: EggAPI.register
    }
  ],
  [
    "/api/eggs/delete",
    {
      name: "Deletes an egg entry",
      requestFn: EggAPI.delete
    }
  ],
  [
    "/api/eggs/change",
    {
      name: "Changes an egg entry",
      requestFn: EggAPI.change
    }
  ],
  [
    "/api/help",
    {
      name: "Gives a list of API functions",
      requestFn: Api.help,
    },
  ],[
    "/api/auth/check",
    {
      name: "Used for logging in, returns true if the authentication was successful",
      requestFn: AuthAPI.check,
    },
  ],
  [
    "/api/user/exists",
    {
      name: "Used for verifying if a user exists",
      requestFn: UserAPI.userExists,
    },
  ],
  [
    "/api/user/create",
    {
      name: "Used for creating users",
      requestFn: UserAPI.createUser,
    },
  ],
  [
    "/api/user/delete",
    {
      name: "Used for deleting users - requires user's username and password",
      requestFn: UserAPI.deleteUser,
    },
  ],
  [
    "/api/user/rename",
    {
      name: "Used for renaming users - requires user's username and password",
      requestFn: UserAPI.renameUser,
    },
  ],
  [
    "/api/user/reset",
    {
      name: "Used for resetting users - requires user's username and password",
      requestFn: UserAPI.resetUser,
    },
  ],
]);

export interface APIComponent {
  name?: string;
  requestFn: (req: Request, res: any) => void;
}
