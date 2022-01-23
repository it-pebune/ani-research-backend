IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'getSubjectAssignedHistory')
	BEGIN
  DROP  Procedure  getSubjectAssignedHistory
END
GO

CREATE PROCEDURE [dbo].getSubjectAssignedHistory(@id INT)
AS
BEGIN
  SET NOCOUNT ON

  SELECT  US.id, U.id assignedToId, U.displayName assignedTo, US.revoked, US.status,
          US.assignedBy assignedById, UA.displayName assignedBy, US.assignedOn,
          US.revokedBy revokedById, UR.displayName revokedBy, US.revokedOn
  FROM    [UserSubject] US
          INNER JOIN
          [User] U ON US.userId = U.id
          INNER JOIN
          [User] UA ON US.assignedBy = UA.id
          INNER JOIN
          [User] UR ON S.revokedBy = UA.id
  WHERE   US.subjectId = @id
END
GO
GRANT EXEC ON [dbo].getSubjectAssignedHistory TO rpb_role
GO