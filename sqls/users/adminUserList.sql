IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'adminUserList')
	BEGIN
  DROP  Procedure  adminUserList
END
GO

CREATE PROCEDURE [dbo].adminUserList(@deleted tinyint)
AS
BEGIN
  SET NOCOUNT ON

  ;
  WITH
    R
    AS
    (
      SELECT userId, MAX(roleId) roleId
      FROM UserRoles
      GROUP BY userId
    )
  SELECT U.id, R.roleId, Ro.role, U.displayName, U.email, U.phone, U.provider,
    U.created, U.updated, U.lastLogin, U.profileImageUrl, U.status
  FROM [User] U
    LEFT JOIN
    R ON R.userId = U.id
    LEFT JOIN
    [Role] Ro on R.roleId = Ro.id
  WHERE   U.deleted = 0 OR @deleted = 1
  ORDER BY displayName
END
GO
GRANT EXEC ON [dbo].adminUserList TO rpb_role
GO