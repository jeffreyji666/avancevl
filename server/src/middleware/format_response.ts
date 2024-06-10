export interface Options {
  type: string;
  code: number
}
function routerResponse(option: Options) {
  // return async function (ctx, next: () => Promise<any>): Promise<any> {
  //   ctx.success = function (data, msg: string) {
  //     ctx.type = option.type || "json";
  //     ctx.body = {
  //       code: option.code || 0,
  //       msg: msg,
  //       data: data
  //     };
  //   };

  //   ctx.fail = function (msg: string, code: number) {
  //     ctx.type = option.type || "json";
  //     ctx.body = {
  //       code: code || option.code || 400,
  //       msg: msg || "fail",
  //     };
  //     console.log(ctx.body);
  //   };

  //   await next();
  // };

}

export const routerResponsePlugin = routerResponse;