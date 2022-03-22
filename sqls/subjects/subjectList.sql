IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'subjectList')
	BEGIN
  DROP  Procedure  subjectList
END
GO

CREATE PROCEDURE [dbo].subjectList(
  @userId   INT,
  @deleted  TINYINT
)
AS
BEGIN
  SET NOCOUNT ON

  ;WITH
    docsCTE(subjectId, docCount, ocrokCount, ocrerrCount, validCount)
  AS
  (
    SELECT  D.subjectId, SUM(1) documentCount,
            SUM(CASE WHEN D.[status] = 1 THEN 1 ELSE 0 END) ocrokCount,
            SUM(CASE WHEN D.[status] = 2 THEN 1 ELSE 0 END) ocrerrCount,
            SUM(CASE WHEN D.[status] = 5 THEN 1 ELSE 0 END) validCount
    FROM    [Document] D
            INNER JOIN
            [Subject] S ON D.subjectId = S.id
              AND (S.deleted = 0 OR @deleted = 1)
              AND (S.assignedTo = @userId OR @userId = 0)
    GROUP BY D.subjectId
  )
  SELECT  S.id, S.firstName, S.lastName, S.sirutaId, S.dob, S.photoUrl,
          Ut.name city, Ut.countyId, C.name county, S.created, S.deleted,
          S.assignedTo assignedToId, U.displayName assignedTo, S.status,
          D.docCount, D.ocrokCount, D.ocrerrCount, validCount
  FROM    [Subject] S
          LEFT JOIN
          Uat Ut ON S.sirutaId = Ut.sirutaId
          LEFT JOIN
          County C ON Ut.countyId = C.id
          LEFT JOIN
          [User] U ON S.assignedTo = U.id
          LEFT JOIN
          docsCTE D ON S.id = D.subjectId
  WHERE   (S.deleted = 0 OR @deleted = 1)
      AND (S.assignedTo = @userId OR @userId = 0)
END
GO
GRANT EXEC ON [dbo].subjectList TO rpb_role
GO