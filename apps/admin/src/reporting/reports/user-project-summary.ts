import { RawSqlResource } from '../raw-sql-resource.js';

// Inlined from the "view_user_project_summary" DB view
// (apps/admin/src/components/admin/SQL-data/View_user_project_summery).
const sql = `
    SELECT
        u.id AS id,
        u.firstname, u.lastname, u.email, t.name AS tshirt_name,
        p.name AS project_name, up.isOwner,
        CASE WHEN qu1.questionId IS NOT NULL THEN 'ja' ELSE 'neen' END AS photo,
        CASE WHEN qu2.questionId IS NOT NULL THEN 'ja' ELSE 'neen' END AS contact,
        CASE WHEN qu3.questionId IS NOT NULL THEN 'ja' ELSE 'neen' END AS approved
    FROM UserProjects up
    JOIN Users u ON up.userId = u.id
    LEFT JOIN Tshirts t ON u.tshirtId = t.id
    JOIN Projects p ON up.projectId = p.id
    LEFT JOIN QuestionUsers qu1 ON u.id = qu1.userId AND qu1.questionId = 1
    LEFT JOIN QuestionUsers qu2 ON u.id = qu2.userId AND qu2.questionId = 2
    LEFT JOIN QuestionUsers qu3 ON u.id = qu3.userId AND qu3.questionId = 3
`;

export const userProjectSummaryResource = new RawSqlResource({
  resourceId: 'view_user_project_summary',
  databaseName: 'Reporting',
  primaryKey: 'id',
  sql,
  columns: [
    { path: 'id', type: 'number' as const, isId: true },
    { path: 'firstname' },
    { path: 'lastname' },
    { path: 'email' },
    { path: 'tshirt_name' },
    { path: 'project_name' },
    { path: 'isOwner', type: 'boolean' as const },
    { path: 'photo' },
    { path: 'contact' },
    { path: 'approved' },
  ],
});
