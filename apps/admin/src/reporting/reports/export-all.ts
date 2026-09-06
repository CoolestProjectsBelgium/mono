import { RawSqlResource } from '../raw-sql-resource.js'

// Inlined from the "view_Export_all" DB view (apps/admin/src/components/admin/SQL-data/View_Export_all):
// no DB view or migration needed any more, just this query.
const sql = `
    SELECT
        u.id AS id,
        u.eventId AS user_event_id,
        u.email, u.lastname, u.firstname,
        u.language AS user_language,
        up.isOwner,
        CASE WHEN qu1.questionId IS NOT NULL THEN 'ja' ELSE 'neen' END AS photo,
        CASE WHEN qu2.questionId IS NOT NULL THEN 'ja' ELSE 'neen' END AS contact,
        CASE WHEN qu3.questionId IS NOT NULL THEN 'ja' ELSE 'neen' END AS approved,
        t.name AS tshirt_name,
        u.postalcode,
        u.municipality_name,
        u.sex,
        u.birthmonth,
        u.via AS via_Coderdojo,
        u.gsm,
        u.gsm_guardian,
        u.internalinfo AS user_internal_info,
        u.email_guardian,
        u.tshirtId,
        u.medical,
        u.last_token,
        p.id AS project_id,
        p.eventId AS project_event_id,
        p.description,
        p.type AS project_type,
        p.internalInformation AS project_internal_info,
        p.language AS project_language,
        p.maxVoucher,
        up.voucherGuid,
        up.projectId,
        up.userId
    FROM UserProjects up
    JOIN Users u ON up.userId = u.id
    LEFT JOIN Tshirts t ON u.tshirtId = t.id
    JOIN Projects p ON up.projectId = p.id
    LEFT JOIN QuestionUsers qu1 ON u.id = qu1.userId AND qu1.questionId = 1
    LEFT JOIN QuestionUsers qu2 ON u.id = qu2.userId AND qu2.questionId = 2
    LEFT JOIN QuestionUsers qu3 ON u.id = qu3.userId AND qu3.questionId = 3
`

export const exportAllResource = new RawSqlResource({
    resourceId: 'view_Export_all',
    databaseName: 'Reporting',
    primaryKey: 'id',
    sql,
    columns: [
        { path: 'id', type: 'number' as const, isId: true },
        { path: 'user_event_id' },
        { path: 'email' },
        { path: 'lastname' },
        { path: 'firstname' },
        { path: 'user_language' },
        { path: 'isOwner', type: 'boolean' as const },
        { path: 'photo' },
        { path: 'contact' },
        { path: 'approved' },
        { path: 'tshirt_name' },
        { path: 'postalcode' },
        { path: 'municipality_name' },
        { path: 'sex' },
        { path: 'birthmonth' },
        { path: 'via_Coderdojo' },
        { path: 'gsm' },
        { path: 'gsm_guardian' },
        { path: 'user_internal_info' },
        { path: 'email_guardian' },
        { path: 'tshirtId' },
        { path: 'medical' },
        { path: 'last_token' },
        { path: 'project_id' },
        { path: 'project_event_id' },
        { path: 'description' },
        { path: 'project_type' },
        { path: 'project_internal_info' },
        { path: 'project_language' },
        { path: 'maxVoucher' },
        { path: 'voucherGuid' },
        { path: 'projectId' },
        { path: 'userId' },
    ],
})
