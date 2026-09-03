import { projectIdOf } from './helpers.mjs';

export function hyperlinksByProjectId(hyperlinks = [], attachments = []) {
  const projectByAttachment = new Map();
  for (const attachment of attachments) {
    projectByAttachment.set(attachment.id, projectIdOf(attachment));
  }
  const byProject = new Map();
  for (const link of hyperlinks) {
    const projectId = projectByAttachment.get(link.AttachmentId ?? link.attachmentId);
    if (projectId == null) continue;
    const href = String(link.href || '').trim();
    if (!href) continue;
    const list = byProject.get(projectId) || [];
    list.push(href);
    byProject.set(projectId, list);
  }
  return byProject;
}

export function appendInternalInformation(existing, urls = []) {
  const base = existing == null ? '' : String(existing).trimEnd();
  if (!urls.length) return base;
  const extra = urls.join('\n');
  return base ? `${base}\n${extra}` : extra;
}
