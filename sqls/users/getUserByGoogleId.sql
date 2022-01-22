IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'getUserByGoogleId')
	BEGIN
  DROP  Procedure  getUserByGoogleId
END
GO

CREATE PROCEDURE [dbo].getUserByGoogleId(
  @googleId varchar(50)
)
AS
BEGIN
  SET NOCOUNT ON

  SELECT U.id id, U.firstName, U.lastName, U.displayName, U.email, U.phone, U.created, U.updated,
    U.profileImageUrl, U.settings, U.provider, U.providerData, U.googleId, U.status
  FROM [dbo].[User] U
  WHERE	U.googleId = @googleId
    AND U.deleted = 0

  SELECT UR.roleId
  FROM [dbo].[User] U
    INNER JOIN
    UserRoles UR ON U.id = UR.userId
  WHERE	U.googleId = @googleId
    AND U.deleted = 0
END
GO
GRANT EXEC ON [dbo].getUserByGoogleId TO rpb_role
GO