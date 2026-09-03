import { randomUUID } from 'node:crypto';
import { asString, eventIdOf, nullableUserId } from './helpers.mjs';

export function mapUserProjects(projects, vouchers, { uuid = randomUUID } = {}) {
  const byProject = new Map();
  for (const voucher of vouchers) {
    const projectId = voucher.projectId;
    const list = byProject.get(projectId) || [];
    list.push(voucher);
    byProject.set(projectId, list);
  }

  const rows = [];
  for (const project of projects) {
    const list = byProject.get(project.id) || [];
    const ownerId = nullableUserId(project.ownerId);
    const ownerVoucher = list.find(
      (voucher) => nullableUserId(voucher.participantId) === ownerId && ownerId != null,
    );
    const used = new Set();

    if (ownerVoucher) {
      rows.push(toUserProject(ownerVoucher, project, true));
      used.add(ownerVoucher.idx ?? ownerVoucher.id);
    } else if (ownerId != null) {
      rows.push({
        isOwner: true,
        voucherGuid: uuid(),
        projectId: project.id,
        userId: ownerId,
        eventId: eventIdOf(project),
        deletedAt: null,
      });
    }

    for (const voucher of list) {
      const key = voucher.idx ?? voucher.id;
      if (used.has(key)) continue;
      rows.push(toUserProject(voucher, project, false));
    }
  }
  return rows;
}

function toUserProject(voucher, project, isOwner) {
  return {
    isOwner,
    voucherGuid: asString(voucher.id),
    projectId: voucher.projectId ?? project.id,
    userId: nullableUserId(voucher.participantId),
    eventId: eventIdOf(voucher) ?? eventIdOf(project),
    deletedAt: null,
  };
}
