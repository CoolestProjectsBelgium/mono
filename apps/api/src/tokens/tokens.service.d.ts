export declare class TokensService {
    constructor();
    generateRegistrationToken(registration_id: number): string;
    generateLoginToken(user_id: number): string;
}
