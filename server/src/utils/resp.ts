interface ResponseFormat {
  code: string | number;
  data: Record<string, any>;
  msg: string
}
const responseFormat = new class {
  constructor() {
    this.response = {
      code: -1,
      data: {},
      msg: ""
    },
      this.statusCode = new Map();
    this.registeStatusCode(0, "OK");
    this.registeStatusCode(-1, "ERROR");
  }
  response: ResponseFormat;
  statusCode: any;
  registeStatusCode(code: number, description: string) {
    this.statusCode.set(code, description);
  }
  registeStatusCodes(arr: string[]) {
    for (let [code, description] of arr) {
      this.statusCode.set(code, description);
    }
  }
  set(data: Record<string, any>, code = 0, msg: string) {
    if (this.statusCode.has(code)) {
      return {
        code,
        data,
        msg: this.statusCode.get(code),
      }
    } else {
      // log Something ,here is an unique code
      return {
        code,
        data,
        msg: msg || "Unresolvable Status Code :" + code,
      }
    }
  }
  error(code = -1, msg: string) {
    if (this.statusCode.has(code)) {
      return {
        code,
        data: {},
        msg: this.statusCode.get(code),
      }
    } else {
      // log Something ,here is an unique code
      return {
        code,
        data: {},
        msg: msg || "Unresolvable Status Code :" + code,
      }
    }
  }
}();

export { responseFormat }