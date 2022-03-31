import argon2 from "argon2";
import { AuthAPI } from "../api/component/auth";
import { DataBaseManagement } from "../db/main";
import url from "url";

class UM {
  getAuth(req: Request|any, override?: string) {
    let header;

    if (override) header = override || ":";
    else header = req.headers.authorization

    const token = (header || "").split(/\s+/).pop() || "";
    const auth = Buffer.from(token, "base64").toString();
    const parts = auth.split(/:/);
    const username = parts.shift();
    const password = parts.join(":");

    return { username, password };
  }

  async userExists(user:string): Promise<boolean> {
    const creddb = await (DataBaseManagement.get("cred"));
    const prefdb = await (DataBaseManagement.get("pref"));

    return !!(creddb[user] && prefdb[user])
  }

  async validateCredentials(user: string, pswd: string) {
    const db = await DataBaseManagement.get("cred");

    if (db[user]) {
      return await argon2.verify(db[user], pswd);
    }
    return false
  }

  async createUser(req: Request, _: Response) {
    const { username, password } = UserManagement.getAuth(req);

    const creddb = await DataBaseManagement.get("cred");
    const prefdb = await DataBaseManagement.get("pref");

    const returnValue: UserReturn = {
      fullfilled: false,
      dbWritten: false,
    };

    if (username && !creddb[username] && !prefdb[username]) {
      returnValue.fullfilled = true;
      const pref = UserManagement.userTemplate;
      const cred = await AuthAPI.encrypt(password);

      pref.name = username;

      creddb[username] = cred;
      prefdb[username] = pref;

      returnValue.dbWritten =
        (await DataBaseManagement.write("cred", creddb)) &&
        (await DataBaseManagement.write("pref", prefdb));
    } else returnValue.fullfilled = false;

    return returnValue;
  }

  async renameUser(req: Request, _: Response) {
    const query = url.parse(req.url, true).query;

    const { username, password } = UserManagement.getAuth(req);

    const newName = query.new;

    const creddb = await DataBaseManagement.get("cred");
    const prefdb = await DataBaseManagement.get("pref");

    const returnValue: UserReturn = {
      fullfilled: false,
      dbWritten: false,
    };

    if (username && creddb[username] && prefdb[username]) {
      const pref = UserManagement.userTemplate;
      const cred = await argon2.verify(creddb[username], password);

      returnValue.fullfilled = cred;

      pref.name = username;

      if (cred) {
        creddb[newName as string] = creddb[username];
        prefdb[newName as string] = prefdb[username];
        delete creddb[username];
        delete prefdb[username];
      }

      returnValue.dbWritten =
        (await DataBaseManagement.write("cred", creddb)) &&
        (await DataBaseManagement.write("pref", prefdb));
    } else returnValue.fullfilled = false;

    return returnValue;
  }

  async deleteUser(req: Request, _: Response) {
    const { username, password } = UserManagement.getAuth(req);

    const creddb = await DataBaseManagement.get("cred");
    const prefdb = await DataBaseManagement.get("pref");

    const returnValue: UserReturn = {
      fullfilled: false,
      dbWritten: false,
    };

    if (username && creddb[username] && prefdb[username]) {
      const cred = await argon2.verify(creddb[username], password);

      returnValue.fullfilled = cred;

      if (cred) {
        delete creddb[username];
        delete prefdb[username];
      }

      returnValue.dbWritten =
        (await DataBaseManagement.write("cred", creddb)) &&
        (await DataBaseManagement.write("pref", prefdb));
    } else returnValue.fullfilled = false;

    return returnValue;
  }

  async resetUser(req: Request, _: Response) {
    const { username, password } = UserManagement.getAuth(req);

    const creddb = await DataBaseManagement.get("cred");
    const prefdb = await DataBaseManagement.get("pref");

    const returnValue: UserReturn = {
      fullfilled: false,
      dbWritten: false,
    };

    if (username && creddb[username] && prefdb[username]) {
      const pref = UserManagement.userTemplate;
      const cred = await argon2.verify(creddb[username], password);

      returnValue.fullfilled = cred;

      pref.name = username;

      if (cred) {
        prefdb[username] = pref;
      }

      returnValue.dbWritten = await DataBaseManagement.write("pref", prefdb);
    } else returnValue.fullfilled = false;

    return returnValue;
  }

  async setUserProperty(req: Request, _: Response): Promise<UserReturn> {
    const query = url.parse(req.url, true).query;

    const { username, password } = UserManagement.getAuth(req);

    const returnValue: UserReturn = {
      fullfilled: false,
      dbWritten: false,
    };

    const key = query.key;
    const val = query.val;

    const creddb = await DataBaseManagement.get("cred");
    const prefdb = await DataBaseManagement.get("pref");

    if (username && creddb[username] && prefdb[username]) {
      const pref = prefdb[username];
      const cred = await argon2.verify(creddb[username], password);

      returnValue.fullfilled = cred;

      if (cred) {
        pref[key as string] = val;
      }

      returnValue.dbWritten = await DataBaseManagement.write("pref", prefdb);
    } else returnValue.fullfilled = false;

    return returnValue;
  }

  async changePassword(req:Request,res:Response) {
    const query = url.parse(req.url, true).query;

    const { username, password } = UserManagement.getAuth(req);
    const newPswd = query.new;

    const returnValue: UserReturn = {
      fullfilled: false,
      dbWritten: false,
    };

    const creddb = await DataBaseManagement.get("cred");
    const prefdb = await DataBaseManagement.get("pref");

    if (username && newPswd && creddb[username] && prefdb[username]) {
      const cred = await argon2.verify(creddb[username], password);

      returnValue.fullfilled = cred;

      if (cred) {
        const hash = await AuthAPI.encrypt(Buffer.from(newPswd as string,'base64').toString())

        creddb[username] = hash;
      }

      returnValue.dbWritten = await DataBaseManagement.write("pref", prefdb);
      returnValue.dbWritten = await DataBaseManagement.write("cred", creddb);
    } else returnValue.fullfilled = false;

    return returnValue;
  }

  userTemplate: userPreferences = {
    name: "",
  };
}

export interface UserPreferenceGetter {
  key: string;
  value: string;
  fullfilled: boolean;
  dbWritten: boolean;
}
export interface UserReturn {
  fullfilled: boolean;
  dbWritten: boolean;
}

export interface IsAdminReturn {
  admin: boolean;
  username: string;
}

export interface userPreferences {
  name: string | undefined;
}

export interface UserProperty {
  key: string;
  value: string;
}

export const UserManagement = new UM();
