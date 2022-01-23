IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'subjectDelete')
	BEGIN
  DROP  Procedure  subjectDelete
END
GO

CREATE PROCEDURE [dbo].subjectDelete(
  @id INT
)
AS
BEGIN
  SET NOCOUNT ON

  UPDATE  [Subject]
  SET     deleted = 1
  WHERE   id = @id

  IF @@ERROR > 0
  BEGIN
    RETURN -1
  END
END
GO
GRANT EXEC ON [dbo].subjectDelete TO rpb_role
GO