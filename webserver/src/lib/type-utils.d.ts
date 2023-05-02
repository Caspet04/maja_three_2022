export type As<Tag extends string> = { __tag: Tag };

export type HTTPError =
    | { code: -1; error: unknown }
    | {
          code: number;
          message: string;
          name: string;
          stack?: HTTPError;
      };
export type HTTPSuccess = {
    code: number;
    message: string;
    name: string;
};
export type HTTPResponse = HTTPError | HTTPSuccess;
