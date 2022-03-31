import { readFile } from "fs/promises";
import { DataBaseManagement } from "../../db/main";
import { Api } from "../main";
import url from "url";
import { ParsedUrlQuery } from "querystring";
import { Strings } from "../../strings/main";
import { AuthAPI } from "./auth";
import { UserManagement } from "../../user/main";
import argon2 from "argon2";

class EAPI {
  async get(req: Request, res: any) {
    const q = url.parse(req.url, true).query;

    const { username, password } = UserManagement.getAuth(req);
    const authdb = await DataBaseManagement.get("cred", true);

    if (username && password && authdb && authdb[username]) {
      if (!(await argon2.verify(authdb[username as string], password))) {
        Api.writeError(
          res,
          "Unable to get entries",
          "The authentication parameters are incorrect."
        );
        return;
      }

      Api.writeResponse(res, await DataBaseManagement.get("eggs", true), true);

      return;
    }

    Api.writeError(
      res,
      "Unable to get entries",
      "The authentication parameters are not specified or the user doesn't exist."
    );
  }

  async register(req: Request, res: any) {
    const q = url.parse(req.url, true).query;

    const { username, password } = UserManagement.getAuth(req);
    const authdb = await DataBaseManagement.get("cred", true);

    if (username && password && authdb && authdb[username]) {
      if (!(await argon2.verify(authdb[username as string], password))) {
        Api.writeError(
          res,
          "Unable to create entry",
          "The authentication parameters are incorrect."
        );
        return;
      }

      if (!EggAPI.checkParams(q, ["registrar", "amount"])) {
        Api.writeError(
          res,
          Strings.entryNotSavedTitle,
          Strings.entryNotSavedMessg
        );

        return;
      }

      const [registrar, amount] = [q.registrar, q.amount];

      const json = {
        registrar,
        amount,
        timestamp: new Date().getTime(),
        id: Math.floor(Math.random() * 2 ** 24),
      };

      const db = (await DataBaseManagement.get("eggs")) as any[];

      console.log(db);

      db.push(json);

      Api.writeResponse(res, json, await DataBaseManagement.write("eggs", db));

      return;
    }
    Api.writeError(
      res,
      "Unable to create entry",
      "The authentication parameters are not specified or the user doesn't exist."
    );
  }

  async delete(req: Request, res: any) {
    const q = url.parse(req.url, true).query;

    const { username, password } = UserManagement.getAuth(req);
    const authdb = await DataBaseManagement.get("cred", true);

    if (username && password && authdb && authdb[username]) {
      if (!(await argon2.verify(authdb[username as string], password))) {
        Api.writeError(
          res,
          "Unable to delete entry",
          "The authentication parameters are incorrect."
        );
        return;
      }

      if (!EggAPI.checkParams(q, ["id"])) {
        Api.writeError(
          res,
          "Cannot delete entry",
          "The parameters are incorrect."
        );

        return;
      }

      const id = q.id;

      const db = (await DataBaseManagement.get("eggs")) as any[];

      let index = undefined;
      let json = undefined;

      for (let i = 0; i < db.length; i++) {
        if (db[i] && db[i].id == id) {
          index = i;
          json = db[i];

          break;
        }
      }

      if (index) db.splice(index, 1);

      Api.writeResponse(res, json, await DataBaseManagement.write("eggs", db));

      return;
    }
    Api.writeError(
      res,
      "Unable to delete entry",
      "The authentication parameters are not specified or the user doesn't exist."
    );
  }

  checkParams(query: ParsedUrlQuery, params: string[]) {
    let valid: boolean = true;

    for (let i = 0; i < params.length; i++) {
      if (!query[params[i]]) valid = false;
      break;
    }

    return valid;
  }

  async change(req: Request, res: any) {
    const q = url.parse(req.url, true).query;

    const { username, password } = UserManagement.getAuth(req);
    const authdb = await DataBaseManagement.get("cred", true);

    if (username && password && authdb && authdb[username]) {
      if (!(await argon2.verify(authdb[username as string], password))) {
        Api.writeError(
          res,
          "Unable to change entry",
          "The authentication parameters are incorrect."
        );
        return;
      }

      if (!EggAPI.checkParams(q, ["id"])) {
        Api.writeError(
          res,
          "Cannot change entry",
          "The parameters are incorrect."
        );

        return;
      }

      const [id, amount, registrar] = [q.id, q.amount, q.registrar];

      const db = (await DataBaseManagement.get("eggs")) as any[];

      let index:number|undefined;
      let json = undefined;

      for (let i = 0; i < db.length; i++) {
        if (db[i] && db[i].id == id) {
          index = i;
          json = db[i];

          break;
        }
      }

      if (!json) {
        Api.writeError(
          res,
          "Unable to change entry",
          "The specified entry id doesn't exist."
        );

        return;
      }

      if (registrar) json.registrar = registrar;
      if (amount) json.amount = amount;

      db[index as number] = json;

      console.log(index, db[index as number])

      Api.writeResponse(res, json, await DataBaseManagement.write("eggs", db));

      return;
    }
    Api.writeError(
      res,
      "Unable to change entry",
      "The authentication parameters are not specified or the user doesn't exist."
    );
  }
}

export const EggAPI = new EAPI();
