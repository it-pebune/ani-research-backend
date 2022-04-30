IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'getDocumentStatus')
	BEGIN
  DROP  Procedure  getDocumentStatus
END
GO

CREATE PROCEDURE [dbo].getDocumentStatus(
  @statusValidated TINYINT,
  @docId      VARCHAR(50) = NULL,
  @subjectId  INT = 0,
  @jobId      INT = 0,
  @createdBy  INT = 0
)
AS
BEGIN
  SET NOCOUNT ON

  SELECT  D.id, D.status
  FROM    [Document] D
  WHERE   [status] < @statusValidated
    AND (@docId IS NULL OR D.id = @docId)
    AND (@subjectId = 0 OR D.subjectId = @subjectId)
    AND (@jobId = 0 OR D.jobId = @jobId)
    AND (@createdBy = 0 OR D.createdBy = @createdBy)
END
GO
GRANT EXEC ON [dbo].getDocumentStatus TO rpb_role
GO