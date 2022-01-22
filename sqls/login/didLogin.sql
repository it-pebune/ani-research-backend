IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'didLogin')
	BEGIN
  DROP  Procedure  didLogin
END
GO

CREATE PROCEDURE [dbo].didLogin(
  @id int,
  @lastLogin datetime2 = NULL,
  @refreshToken varchar(64) = NULL,
  @refreshTokenExpires datetime2 = NULL
)
AS
BEGIN
  SET NOCOUNT ON

  SET @lastLogin = ISNULL(@lastLogin, GETDATE());

  UPDATE	[dbo].[User]
    SET		lastLogin = @lastLogin,
        refreshToken = @refreshToken,
        refreshTokenExpires = @refreshTokenExpires
    WHERE	id = @id
END
GO
GRANT EXEC ON [dbo].didLogin TO rpb_role
GO