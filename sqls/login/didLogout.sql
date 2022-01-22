IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'didLogout')
	BEGIN
  DROP  Procedure  didLogout
END
GO

CREATE PROCEDURE [dbo].didLogout(
  @id int,
  @refreshTokenExpires datetime2
)
AS
BEGIN
  SET NOCOUNT ON

  UPDATE	[dbo].[User]
	SET		refreshToken = NULL,
			  refreshTokenExpires = @refreshTokenExpires
	WHERE	id = @id
END
GO
GRANT EXEC ON [dbo].didLogout TO rpb_role
GO