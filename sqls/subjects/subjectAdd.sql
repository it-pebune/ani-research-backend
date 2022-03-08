IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'subjectAdd')
	BEGIN
  DROP  Procedure  subjectAdd
END
GO

CREATE PROCEDURE [dbo].subjectAdd(
  @uuid       VARCHAR(50),
  @firstName  VARCHAR(100),
  @lastName   VARCHAR(100),
  @dob        DATE,
  @sirutaId   INT = 0,
  @photoUrl   VARCHAR(MAX) = '',
  @notes      VARCHAR(MAX) = '',
  @subjectId  INT OUTPUT
)
AS
BEGIN
  SET NOCOUNT ON

  IF @sirutaId = 0 SET @sirutaId = NULL

  INSERT INTO [Subject](uuid, firstName, lastName, dob, sirutaId, photoUrl, notes)
  VALUES (@uuid, @firstName, @lastName, @dob, @sirutaId, @photoUrl, @notes)

  IF @@ERROR > 0
  BEGIN
    RETURN -1
  END

  SET @subjectId = SCOPE_IDENTITY()
END
GO
GRANT EXEC ON [dbo].subjectAdd TO rpb_role
GO