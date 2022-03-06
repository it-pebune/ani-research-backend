IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'documentUpdateDataRaw')
	BEGIN
  DROP  Procedure  documentUpdateDataRaw
END
GO

CREATE PROCEDURE [dbo].documentUpdateDataRaw(
  @docId  VARCHAR(50),
  @data   VARCHAR(MAX)
)
AS
BEGIN
  SET NOCOUNT ON

  UPDATE  Document
  SET     [dataRaw] = @data,
          updated = GETDATE()
  WHERE   id = @docId
END
GO
GRANT EXEC ON [dbo].documentUpdateDataRaw TO rpb_role
GO