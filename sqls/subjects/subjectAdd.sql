IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'subjectAdd')
	BEGIN
  DROP  Procedure  subjectAdd
END
GO

CREATE PROCEDURE [dbo].subjectAdd(
  @uuid       VARCHAR(50),
  @firstName  NVARCHAR(100),
  @lastName   NVARCHAR(100),
  @dob        DATE,
  @sirutaId   INT = 0,
  @photoUrl   VARCHAR(MAX) = '',
  @notes      VARCHAR(MAX) = '',
  @hash       CHAR(40),
  @subjectId  INT OUTPUT
)
AS
BEGIN
  SET NOCOUNT ON

  IF @sirutaId = 0 SET @sirutaId = NULL

  INSERT INTO [Subject](uuid, firstName, lastName, dob, sirutaId, photoUrl, notes, [hash])
  VALUES (@uuid, @firstName, @lastName, @dob, @sirutaId, @photoUrl, @notes, @hash)

  IF @@ERROR > 0
  BEGIN
    RETURN -1
  END

  SET @subjectId = SCOPE_IDENTITY()
END
GO
GRANT EXEC ON [dbo].subjectAdd TO rpb_role
GO