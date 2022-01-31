IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'getUserByRefreshToken')
	BEGIN
  DROP  Procedure  getUserByRefreshToken
END
GO

CREATE PROCEDURE [dbo].getUserByRefreshToken(
  @refreshToken			    VARCHAR(64),
  @refreshTokenExpires	DATETIME2
)
AS
BEGIN
  SET NOCOUNT ON

  SELECT U.id id, U.firstName, U.lastName, U.displayName, U.email, U.phone, U.provider,
    U.googleId, U.created, U.updated, U.profileImageUrl, U.settings, U.status
  FROM [dbo].[User] U
  WHERE	U.deleted = 0
    AND U.refreshToken = @refreshToken
    AND U.refreshTokenExpires > @refreshTokenExpires

  SELECT UR.roleId
  FROM [dbo].[User] U
    INNER JOIN
    UserRoles UR ON U.id = UR.userId
  WHERE	U.deleted = 0
    AND U.refreshToken = @refreshToken
    AND U.refreshTokenExpires > @refreshTokenExpires
END
GO
GRANT EXEC ON [dbo].getUserByRefreshToken TO rpb_role
GO