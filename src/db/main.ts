import { existsSync } from "fs";
import { Env } from "../env/main";
import { readFile, writeFile } from "fs/promises";

class DBM {
  async verifyFiles() {
    for (const path of Env.databases) {
      let exists = false;

      const db = await this.get(path[0], false);

      if (!(await existsSync(path[1].path)) || db == "") {
        exists = false;

        writeFile(path[1].path, "{}", { encoding: "utf-8" });
      } else exists = true;

      console.log(
        `${`DB: verifyFiles: Database file ${path[1].path} (${path[1].name})`.padEnd(
          70,
          " "
        )} ${exists ? "[PRESENT]" : "[MISSING]"}`
      );
    }
  }

  async get(name: string, json: boolean = true) {
    const defReturn = json ? {} : "{}";
    if (Env.databases.has(name) && Env.databases.get(name)?.path) {
      try {
        if (json)
          return JSON.parse(
            await readFile(Env.databases.get(name)?.path!, {
              encoding: "utf-8",
            })
          );

        return await readFile(Env.databases.get(name)?.path!, {
          encoding: "utf-8",
        });
      } catch {
        return defReturn;
      }
    } else {
      return defReturn;
    }
  }

  async write(name: string, data: {}) {
    if (Env.databases.has(name) && Env.databases.get(name)?.path) {
      writeFile(Env.databases.get(name)?.path!, JSON.stringify(data), {
        encoding: "utf-8",
      });
      return true;
    }
    return false;
  }
}

export interface DBPath {
  path: string;
  name: string;
}

export const DataBaseManagement = new DBM();
