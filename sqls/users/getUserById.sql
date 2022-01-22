IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'getUserById')
	BEGIN
  DROP  Procedure  getUserById
END
GO

CREATE PROCEDURE [dbo].getUserById(@id INT)
AS
BEGIN
  SET NOCOUNT ON

  SELECT U.id id, U.firstName, U.lastName, U.displayName, U.email, U.phone, U.created, U.updated,
    U.profileImageUrl, U.settings, U.provider, U.providerData, U.googleId, U.status, U.socialInfo,
    U.notes
  FROM [dbo].[User] U
  WHERE	U.id = @id
    AND U.deleted = 0

  SELECT UR.roleId
  FROM [dbo].[User] U
    INNER JOIN
    UserRoles UR ON U.id = UR.userId
  WHERE	U.id = @id
    AND U.deleted = 0
END
GO
GRANT EXEC ON [dbo].getUserById TO rpb_role
GO