IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'jobposDelete')
	BEGIN
  DROP  Procedure  jobposDelete
END
GO

CREATE PROCEDURE [dbo].jobposDelete(
  @jobId  INT
)
AS
BEGIN
  SET NOCOUNT ON

  UPDATE  JobPosition
  SET     deleted = 1
  WHERE   id = @jobId
END
GO
GRANT EXEC ON [dbo].jobposDelete TO rpb_role
GO