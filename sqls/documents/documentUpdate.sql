IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'documentUpdate')
	BEGIN
  DROP  Procedure  documentUpdate
END
GO

CREATE PROCEDURE [dbo].documentUpdate(
  @docId  VARCHAR(50),
  @userId INT,
  @type   TINYINT,
  @status TINYINT,
  @name   VARCHAR(MAX)
)
AS
BEGIN
  SET NOCOUNT ON

  UPDATE  Document
  SET     [type] = @type,
          [status] = @status,
          [name] = @name,
          updatedBy = @userId,
          updated = GETDATE()
  WHERE   id = @docId
END
GO
GRANT EXEC ON [dbo].documentUpdate TO rpb_role
GO