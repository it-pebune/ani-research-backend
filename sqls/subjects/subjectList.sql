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

  SELECT  S.id, S.firstName, S.lastName, S.sirutaId, S.dob, S.photoUrl,
          Ut.name city, Ut.countyId, C.name county, S.created, S.deleted,
          S.assignedTo assignedToId, U.displayName assignedTo, S.status
  FROM    [Subject] S
          LEFT JOIN
          Uat Ut ON S.sirutaId = Ut.sirutaId
          LEFT JOIN
          County C ON Ut.countyId = C.id
          LEFT JOIN
          [User] U ON S.assignedTo = U.id
  WHERE   (S.deleted = 0 OR @deleted = 1)
      AND (S.assignedTo = @userId OR @userId = 0)
END
GO
GRANT EXEC ON [dbo].subjectList TO rpb_role
GO