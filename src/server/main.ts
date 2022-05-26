import http from "http";
import url from "url";
import { Api } from "../api/main";

class SM {
  startServer(name: string, port: number = this.defaultPort) {
    console.log(`Starting ${name} server on port ${port}`);
    http
      .createServer(async function (req: any, res: any) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "*");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, OPTIONS, PUT, PATCH, DELETE"
        );
        res.setHeader("Accept-Ranges", "bytes");

        res.setHeader("Access-Control-Allow-Credentials", true);

        const udata = url.parse(req.url, true);
        const pathList = udata.pathname || "";

        if (pathList != "/favicon.ico") {
          Api.eval(pathList, req, res);
        }
      })
      .listen(port);
  }

  defaultPort = 9000;
}

export const ServerManagement = new SM();
