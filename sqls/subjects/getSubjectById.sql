IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'getSubjectById')
	BEGIN
  DROP  Procedure  getSubjectById
END
GO

CREATE PROCEDURE [dbo].getSubjectById(@id INT)
AS
BEGIN
  SET NOCOUNT ON

  SELECT  S.id, S.uuid, S.firstName, S.lastName, S.sirutaId, S.dob, S.photoUrl,
          Ut.name city, Ut.countyId, C.name county, S.created, S.updated, S.deleted,
          S.assignedTo assignedToId, U.displayName assignedTo, S.status
  FROM    [Subject] S
          LEFT JOIN
          Uat Ut ON S.sirutaId = Ut.sirutaId
          LEFT JOIN
          County C ON Ut.countyId = C.id
          LEFT JOIN
          [User] U ON S.assignedTo = U.id
  WHERE   S.id = @id
END
GO
GRANT EXEC ON [dbo].getSubjectById TO rpb_role
GO