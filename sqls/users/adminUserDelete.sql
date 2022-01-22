IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'adminUserDelete')
	BEGIN
  DROP  Procedure  adminUserDelete
END
GO

CREATE PROCEDURE [dbo].adminUserDelete(
  @id     INT,
  @status TINYINT
)
AS
BEGIN
  SET NOCOUNT ON

  -- BEGIN TRANSACTION

  UPDATE	[dbo].[User]
	SET	deleted = 1,
      [status] = @status,
      updated = GETDATE()
	WHERE	id = @id

  IF @@ERROR <> 0
  BEGIN
    -- ROLLBACK TRANSACTION
    RETURN -1
  END

  -- DELETE FROM UserRoles WHERE userId = @id

  -- IF @@ERROR <> 0
  -- BEGIN
  --   ROLLBACK TRANSACTION
  --   RETURN -2
  -- END

  -- COMMIT TRANSACTION
END
GO
GRANT EXEC ON [dbo].adminUserDelete TO rpb_role
GO