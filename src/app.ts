import { Application } from "https://deno.land/x/abc/mod.ts";
import { readLines } from "https://deno.land/std/io/bufio.ts";

import { WX } from "./wx/wx.ts";
import { 文件处理 } from "./lib/文件处理.ts";

// console.log(await 文件处理.替换("D:/work code/测试环境部署/text.text", [{ regExp: /晴天/, str: "青天" }]));

const app = new Application();

app
  .use((next) => {
    return (c) => {
      c.response.headers.set("Access-Control-Allow-Origin", "*");
      return next(c);
    };
  })
  .post("/wx_build", async (c) => {
    const body = (await c.body()) as string;
    const exp1 = {
      pretreatment: [
        {
          path: "D:/work code/npp_beta/dist/build/mp-weixin/common/vendor.js",
          rule: [
            {
              regExp: "",
              str: `server_address:"https://wjwxtest.wanw.xin",service_tel`,
            },
          ],
        },
      ],
      project: {
        params: {
          pathName: "pages/home/skeleton/skeleton",
          query: "",
        },
        projectPath: "D:/work code/npp_beta/dist/build/mp-weixin",
      },
    };
    const r = JSON.parse(body) as typeof exp1;
    const res = await WX.编译到指定server(r);
    if (typeof res === "string") {
      // console.log(res);
    }
    return res;
  })
  .start({ port: 3098 });
console.log("服务启动成功，监听 3098");
console.log(Deno.env.get("wxtoolPath"));

async function redeToJson(reader: Deno.Reader) {
  let res = "";
  for await (const line of readLines(reader)) {
    res += line + "\n";
  }

  return JSON.parse(res);
}
