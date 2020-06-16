import { readLines } from "https://deno.land/std/io/bufio.ts";
import { 文件处理 } from "../lib/文件处理.ts";
export namespace WX {
  // build(`D:/work code/double_matrix/dist/build/mp-weixin`, { pathName: "pages/index/index", query: "is_preview=true" });
  export async function build(options: { projectPath: string; params: { pathName: string; query: string } }) {
    const cwd = "D:/app2/wxtool/";
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
      if (line.includes("需要登录")) {
        return WX_Error[0];
      }
    }
    return lines.join("\n");
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
    msg: "需要登录",
  },
};
