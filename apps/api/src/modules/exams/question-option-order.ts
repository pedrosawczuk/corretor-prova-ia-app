import { questionOptionsTable, sql } from '@app/db'

export const questionOptionsOrderBy = sql`CASE ${questionOptionsTable.letter} WHEN 'V' THEN 0 WHEN 'F' THEN 1 ELSE ascii(${questionOptionsTable.letter}) END`
