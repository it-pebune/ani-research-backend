IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'adminUserUpdateNotes')
	BEGIN
  DROP  Procedure  adminUserUpdateNotes
END
GO

CREATE PROCEDURE [dbo].adminUserUpdateNotes(
  @id			INT,
  @notes  VARCHAR(MAX)
)
AS
BEGIN
  SET NOCOUNT ON

  UPDATE	[dbo].[User]
	SET	notes = @notes
	WHERE	id = @id

  IF @@ERROR <> 0
  BEGIN
    RETURN -1
  END
END
GO
GRANT EXEC ON [dbo].adminUserUpdateNotes TO rpb_role
GO