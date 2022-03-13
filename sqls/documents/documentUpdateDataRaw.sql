IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'documentUpdateDataRaw')
	BEGIN
  DROP  Procedure  documentUpdateDataRaw
END
GO

CREATE PROCEDURE [dbo].documentUpdateDataRaw(
  @docId  VARCHAR(50),
  @status TINYINT,
  @data   VARCHAR(MAX) = NULL
)
AS
BEGIN
  SET NOCOUNT ON

  UPDATE  Document
  SET     [dataRaw] = @data,
          [status] = @status,
          updated = GETDATE()
  WHERE   id = @docId
END
GO
GRANT EXEC ON [dbo].documentUpdateDataRaw TO rpb_role
GO