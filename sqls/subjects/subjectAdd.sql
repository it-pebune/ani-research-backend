IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'subjectAdd')
	BEGIN
  DROP  Procedure  subjectAdd
END
GO

CREATE PROCEDURE [dbo].subjectAdd(
  @uuid      VARCHAR(50),
  @firstName VARCHAR(100),
  @middleName VARCHAR(50),
  @lastName VARCHAR(100),
  @dob DATE,
  @sirutaId INT,
  @notes VARCHAR(MAX) = '',
  @subjectId INT OUTPUT
)
AS
BEGIN
  SET NOCOUNT ON

  INSERT INTO [Subject](uuid, firstName, middleName, lastName, dob, sirutaId, notes)
  VALUES (@uuid, @firstName, @middleName, @lastName, @dob, @sirutaId, @notes)

  IF @@ERROR > 0
  BEGIN
    RETURN -1
  END

  SET @subjectId = SCOPE_IDENTITY()
END
GO
GRANT EXEC ON [dbo].subjectAdd TO rpb_role
GO