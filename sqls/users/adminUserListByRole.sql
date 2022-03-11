IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'adminUserListByRole')
	BEGIN
  DROP  Procedure  adminUserListByRole
END
GO

CREATE PROCEDURE [dbo].adminUserListByRole(@roleId TINYINT)
AS
BEGIN
  SET NOCOUNT ON

  ;WITH UserSubjectsView
  AS
  (
      SELECT userId, COUNT(1) subjectCount
      FROM  UserSubjects
      WHERE revoked = 0
      GROUP BY userId
  )
  SELECT U.id, R.roleId, U.displayName, U.email, US.subjectCount
  FROM  [User] U
        INNER JOIN
        UserRoles R ON R.userId = U.id AND R.roleId = @roleId
        LEFT JOIN
        UserSubjectsView US ON U.id = US.userId
  WHERE U.deleted = 0
  ORDER BY displayName
END
GO
GRANT EXEC ON [dbo].adminUserListByRole TO rpb_role
GO