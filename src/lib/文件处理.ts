export namespace 文件处理 {
  export async function 替换(options: { path: string; rule: { regExp: RegExp | string; str: string }[] }) {
    let text = await Deno.readTextFile(options.path);
    for (let i = 0; i < options.rule.length; i++) {
      const el = options.rule[i];
      const regExp = typeof el.regExp === "string" ? new RegExp(el.regExp) : el.regExp;
      text = text.replace(regExp, el.str);
    }
    return Deno.writeTextFile(options.path, text);
  }
  export async function 批量替换(batch: Parameters<typeof 替换>[0][]) {
    return Promise.all(batch.map(替换));
  }
}
