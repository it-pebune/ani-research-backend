IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'deserializeUser')
	BEGIN
  DROP  Procedure  deserializeUser
END
GO

CREATE PROCEDURE [dbo].deserializeUser(
  @userId		INT,
  @suspended	BIT = 0
)
AS
BEGIN
  SET NOCOUNT ON

  SELECT U.id id, U.firstName, U.lastName, U.displayName, U.email, U.phone, U.provider,
    U.googleId, U.created, U.updated, U.profileImageUrl, U.settings, U.status, U.socialInfo
  FROM [dbo].[User] U
  WHERE	U.id = @userId
    AND U.deleted = 0

  SELECT UR.roleId
  FROM [dbo].[User] U
    INNER JOIN
    UserRoles UR ON U.id = UR.userId
  WHERE	U.id = @userId
    AND U.deleted = 0
END
GO
GRANT EXEC ON [dbo].deserializeUser TO rpb_role
GO