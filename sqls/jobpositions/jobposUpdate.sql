IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'jobposUpdate')
	BEGIN
  DROP  Procedure  jobposUpdate
END
GO

CREATE PROCEDURE [dbo].jobposUpdate(
  @jobId          INT,
  @institutionId  INT,
  @sirutaId       INT,
  @dateStart      DATE,
  @dateEnd        DATE,
  @name           NVARCHAR(300),
  @info           NVARCHAR(MAX)
)
AS
BEGIN
  SET NOCOUNT ON

  UPDATE  JobPosition
  SET     institutionId = @institutionId,
          sirutaId = @sirutaId,
          [name] = @name,
          dateStart = @dateStart,
          dateEnd = @dateEnd,
          aditionalInfo = @info
  WHERE   id = @jobId
END
GO
GRANT EXEC ON [dbo].jobposUpdate TO rpb_role
GO