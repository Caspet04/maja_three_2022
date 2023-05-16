import { StatusClasses } from "http-status-codes";

type _HTTPResponse = {
    action?: string;
    message: string;
    name: string;
    stack?: HTTPResponse;
};

export type HTTPInformational = _HTTPResponse & {
    code: StatusClasses.Informational;
};

export type HTTPSuccessful = _HTTPResponse & {
    code: StatusClasses.Successful;
};

export type HTTPRedirection = _HTTPResponse & {
    code: StatusClasses.Redirection;
};

export type HTTPClientError = _HTTPResponse & {
    code: StatusClasses.ClientError;
};

export type HTTPServerError = _HTTPResponse & {
    code: StatusClasses.ServerError;
};

export type HTTPResponse =
    | HTTPInformational
    | HTTPSuccessful
    | HTTPRedirection
    | HTTPClientError
    | HTTPServerError;

export type HTTPError = HTTPClientError | HTTPServerError;

export function is_informational(
    http_response: HTTPResponse
): http_response is HTTPInformational {
    return StatusClasses.Informational.LIST.some(
        (code) => code == http_response.code
    );
}

export function is_successful(
    http_response: HTTPResponse
): http_response is HTTPSuccessful {
    return StatusClasses.Successful.LIST.some(
        (code) => code == http_response.code
    );
}

export function is_redirection(
    http_response: HTTPResponse
): http_response is HTTPRedirection {
    return StatusClasses.Redirection.LIST.some(
        (code) => code == http_response.code
    );
}

export function is_client_error(
    http_response: HTTPResponse
): http_response is HTTPClientError {
    return StatusClasses.ClientError.LIST.some(
        (code) => code == http_response.code
    );
}

export function is_server_error(
    http_response: HTTPResponse
): http_response is HTTPServerError {
    return StatusClasses.ServerError.LIST.some(
        (code) => code == http_response.code
    );
}

export function is_http_error(
    http_response: HTTPResponse
): http_response is HTTPError {
    return is_client_error(http_response) || is_server_error(http_response);
}
