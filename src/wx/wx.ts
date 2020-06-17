import { readLines } from "https://deno.land/std/io/bufio.ts";
import { 文件处理 } from "../lib/文件处理.ts";
export namespace WX {
  // build(`D:/work code/double_matrix/dist/build/mp-weixin`, { pathName: "pages/index/index", query: "is_preview=true" });
  export async function build(options: { projectPath: string; params: { pathName: string; query: string } }) {
    const cwd = Deno.env.get("wxtoolPath") || "D:/app2/wxtool/";
    console.log("微信开发者工具地址", cwd);

    const p = Deno.run({
      cmd: [
        // "node",
        `${cwd}cli.bat`,
        "preview",
        "--project",
        options.projectPath,
        "--compile-condition",
        `{"pathName":"${options.params.pathName}","query":"${options.params.query}"}`,
      ],
      cwd,
      stdout: "piped",
    });
    let lines = [] as string[];
    for await (const line of readLines(p.stdout)) {
      //   console.log( line);
      lines.push(line);
      if (line.includes("需要重新登录")) {
        return WX_Error[0];
      }
    }
    return lines.join("\n");
  }

  const enum loginFSM_enum {
    空闲,
    等待扫码,
    生成中,
  }
  const loginFSM = {
    status: loginFSM_enum.空闲,
    code: "",
    getCode() {
      if (this.status === loginFSM_enum.空闲) {
        this.status = loginFSM_enum.生成中;
        return new Promise(async (s, j) => {
          const cwd = Deno.env.get("wxtoolPath");
          const p = Deno.run({
            cmd: [`${cwd}cli.bat`, "login"],
            cwd,
            stdout: "piped",
          });
          let lines = [] as string[];
          for await (const line of readLines(p.stdout)) {
            lines.push(line);
            if (lines.length === 38) {
              this.code = lines.join("\n");
              this.status = loginFSM_enum.等待扫码;
              s(this.code);
            }
          }
          j({ code: 1, msg: "已成功或者超时" });
          this.status = loginFSM_enum.空闲;
        });
      } else if (this.status === loginFSM_enum.等待扫码) {
        return this.code;
      } else if (this.status === loginFSM_enum.生成中) {
        return new Promise((s) => {
          const id = setInterval(() => {
            if (this.status === loginFSM_enum.等待扫码) {
              clearInterval(id);
              return this.code;
            }
          }, 100);
        });
      }
    },
  };

  export async function login() {
    return loginFSM.getCode();
  }

  export async function loginIsIdle() {
    return loginFSM.status === loginFSM_enum.空闲;
  }

  export async function 编译到指定server(options: {
    pretreatment: Parameters<typeof 文件处理["批量替换"]>[0];
    project: {
      projectPath: string;
      params: { pathName: string; query: string };
    };
  }) {
    await 文件处理.批量替换(options.pretreatment);
    return build(options.project);
  }
}

const WX_Error = {
  0: {
    code: 10,
    msg: "需要登录",
  },
};
