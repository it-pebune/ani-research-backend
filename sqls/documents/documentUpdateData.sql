IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'documentUpdateData')
	BEGIN
  DROP  Procedure  documentUpdateData
END
GO

CREATE PROCEDURE [dbo].documentUpdateData(
  @docId  VARCHAR(50),
  @userId INT,
  @data   VARCHAR(MAX)
)
AS
BEGIN
  SET NOCOUNT ON

  UPDATE  Document
  SET     [data] = @data,
          updatedBy = @userId,
          updated = GETDATE()
  WHERE   id = @docId
END
GO
GRANT EXEC ON [dbo].documentUpdateData TO rpb_role
GO