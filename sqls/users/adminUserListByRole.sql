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

  SELECT U.id, R.roleId, U.displayName, U.email
  FROM  [User] U
        INNER JOIN
        UserRoles R ON R.userId = U.id AND R.roleId = @roleId
  WHERE U.deleted = 0
  ORDER BY displayName
END
GO
GRANT EXEC ON [dbo].adminUserListByRole TO rpb_role
GO