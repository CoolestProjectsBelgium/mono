import { Project } from '@coolestprojects/database';
import { Voucher } from '@coolestprojects/database';
export declare class ParticipantService {
    private readonly projectModel;
    private readonly voucherModel;
    constructor(projectModel: typeof Project, voucherModel: typeof Voucher);
    generateParticipantVoucher(userOwnerId: number): Promise<Voucher>;
    private generateUniqueToken;
}
