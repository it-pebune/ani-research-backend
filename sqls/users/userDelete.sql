IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'userDelete')
	BEGIN
  DROP  Procedure  userDelete
END
GO

CREATE PROCEDURE [dbo].userDelete(
  @id     INT,
  @status TINYINT
)
AS
BEGIN
  SET NOCOUNT ON

  UPDATE	[dbo].[User]
	SET	deleted = 2,
      [status] = @status,
      updated = GETDATE()
	WHERE	id = @id

  IF @@ERROR <> 0
  BEGIN
    RETURN -1
  END
END
GO
GRANT EXEC ON [dbo].userDelete TO rpb_role
GO