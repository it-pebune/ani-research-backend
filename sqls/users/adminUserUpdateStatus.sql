IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'adminUserUpdateStatus')
	BEGIN
  DROP  Procedure  adminUserUpdateStatus
END
GO

CREATE PROCEDURE [dbo].adminUserUpdateStatus(
  @id					  INT,
  @status       TINYINT = 1
)
AS
BEGIN
  SET NOCOUNT ON

  UPDATE	[dbo].[User]
	SET	[status] = @status,
			updated = GETDATE()
	WHERE	id = @id

  IF @@ERROR <> 0
  BEGIN
    RETURN -1
  END
END
GO
GRANT EXEC ON [dbo].adminUserUpdateStatus TO rpb_role
GO