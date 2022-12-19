IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'jobposAdd')
	BEGIN
  DROP  Procedure  jobposAdd
END
GO

CREATE PROCEDURE [dbo].jobposAdd(
  @subjectId      INT,
  @institutionId  INT,
  @sirutaId       INT,
  @dateStart      DATE,
  @dateEnd        DATE,
  @name           NVARCHAR(300),
  @info           NVARCHAR(MAX),
  @jobId          INT OUTPUT
)
AS
BEGIN
  SET NOCOUNT ON

  INSERT INTO JobPosition(subjectId, institutionId, sirutaId, [name], dateStart, dateEnd, aditionalInfo)
  VALUES (@subjectId, @institutionId, @sirutaId, @name, @dateStart, @dateEnd, @info)

  SET @jobId = SCOPE_IDENTITY()
END
GO
GRANT EXEC ON [dbo].jobposAdd TO rpb_role
GO