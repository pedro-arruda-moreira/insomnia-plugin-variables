import { RequestContext } from "../insomnia-api/InsomniaAPI";

export interface RequestHandler {
    beforeRequest(context: RequestContext): void;
}