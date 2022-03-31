import { UserManagement, UserProperty } from "../../user/main";
import { Api } from "../main";
import url from 'url';

class UAPI {
  async createUser(req: Request, res: any) {
    const state = await UserManagement.createUser(req, res);

    let errorOut = false;
    let errorMessage = "";

    const errorTitle = "Unable to create user";

    errorOut = !state.dbWritten || !state.fullfilled;

    if (!state.dbWritten) 
      errorMessage = "An error occurred while writing the database file.";

    if (!state.fullfilled)
      errorMessage =
        "An error occurred while creating the user: the user already exists.";

    if (errorOut) {
      Api.writeError(res, errorTitle, errorMessage);
    } else
      Api.writeResponse(
        res,
        {
          status: "User created successfully",
        },
        true
      );
  }

  async deleteUser(req: Request, res: any) {
    const state = await UserManagement.deleteUser(req, res);

    let errorOut = false;
    let errorMessage = "";

    const errorTitle = "Unable to delete user";

    errorOut = !state.dbWritten || !state.fullfilled;

    if (!state.dbWritten)
      errorMessage = "An error occurred while writing the database file.";

    if (!state.fullfilled)
      errorMessage =
        "An error occurred while deleting the user: the user doesn't exist.";

    if (errorOut) {
      Api.writeError(res, errorTitle, errorMessage);
    } else
      Api.writeResponse(
        res,
        {
          status: "User deleted successfully",
        },
        true
      );
  }

  async renameUser(req: Request, res: any) {
    const state = await UserManagement.renameUser(req, res);

    let errorOut = false;
    let errorMessage = "";

    const errorTitle = "Unable to rename user";

    errorOut = !state.dbWritten || !state.fullfilled;

    if (!state.dbWritten)
      errorMessage = "An error occurred while writing the database file.";

    if (!state.fullfilled)
      errorMessage =
        "An error occurred while renaming the user: the user doesn't exist.";

    if (errorOut) {
      Api.writeError(res, errorTitle, errorMessage);
    } else
      Api.writeResponse(
        res,
        {
          status: "User renamed successfully",
        },
        true
      );
  }

  async resetUser(req:any, res: any) {
    const state = await UserManagement.resetUser(req, res);

    let errorOut = false;
    let errorMessage = "";

    const errorTitle = "Unable to reset user";

    errorOut = !state.dbWritten || !state.fullfilled;

    if (!state.dbWritten)
      errorMessage = "An error occurred while writing the database file.";

    if (!state.fullfilled)
      errorMessage =
        "An error occurred while resetring the user: the user doesn't exist.";

    if (errorOut) {
      Api.writeError(res, errorTitle, errorMessage);
    } else
      Api.writeResponse(
        res,
        {
          status: "User reset successfully",
        },
        true
      );
  }

  async setUserProperty(req: Request, res: any) {
    const setter = await UserManagement.setUserProperty(req,res);

    let errorOut = false;
    let errorMessage = "";

    const errorTitle = "Unable to set user property";

    errorOut = !setter.dbWritten || !setter.fullfilled;

    if (!setter.dbWritten)
      errorMessage = "An error occurred while writing the database file.";

    if (!setter.fullfilled)
      errorMessage =
        "An error occurred while setting the user property: the user doesn't exist.";

    if (errorOut) {
      Api.writeError(res, errorTitle, errorMessage);
    } else
      Api.writeResponse(
        res,
        {
          status: "User property set successfully",
        },
        true
      );
  }

  async changeUserPassword(req: Request, res: any) {
    const result = await UserManagement.changePassword(req,res);

    let errorOut = false;
    let errorMessage = "";

    const errorTitle = "Unable to set password";

    errorOut = !result.dbWritten || !result.fullfilled;

    if (!result.dbWritten)
      errorMessage = "An error occurred while writing the database file.";

    if (!result.fullfilled)
      errorMessage =
        "An error occurred while changing the password: the user doesn't exist";

    if (errorOut) {
      Api.writeError(res, errorTitle, errorMessage);
    } else
      Api.writeResponse(
        res,
        {
          status: "User password changed.",
        },
        true
      );
  }


  async userExists(req:Request,res:Response) {
    const query = url.parse(req.url, true).query;

    const exists = await UserManagement.userExists(query.user as string);

    Api.writeResponse(res,{
      exists
    });
  }
}

export const UserAPI = new UAPI();
