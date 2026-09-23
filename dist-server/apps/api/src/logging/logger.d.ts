export declare const loggerConfig: {
    level: string;
    redact: {
        paths: string[];
        censor: string;
    };
    serializers: {
        req(req: any): {
            method: any;
            url: any;
            path: any;
            parameters: any;
            headers: {
                host: any;
                'user-agent': any;
                'x-request-id': any;
            };
        };
        res(res: any): {
            statusCode: any;
        };
    };
};
