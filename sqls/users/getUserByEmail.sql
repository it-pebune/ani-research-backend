IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'getUserByEmail')
	BEGIN
  DROP  Procedure  getUserByEmail
END
GO

CREATE PROCEDURE [dbo].getUserByEmail(@email VARCHAR(100))
AS
BEGIN
  SET NOCOUNT ON

  SELECT U.id id, U.firstName, U.lastName, U.displayName, U.email, U.phone, U.provider,
    U.googleId, U.created, U.updated, U.profileImageUrl, U.settings, U.status
  FROM [dbo].[User] U
  WHERE	U.email = @email
    AND U.deleted = 0

  SELECT UR.roleId
  FROM [dbo].[User] U
    INNER JOIN
    UserRoles UR ON U.id = UR.userId
  WHERE	U.email = @email
    AND U.deleted = 0
END
GO
GRANT EXEC ON [dbo].getUserByEmail TO rpb_role
GO